// src/services/notificationService.js
const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      // Read service account from environment variable or file
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || '',
      });
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error.message);
      console.warn('Push notifications will not work without valid Firebase credentials');
    }
  }
};

// Send notification to a single device
exports.sendNotification = async (deviceToken, notification) => {
  try {
    if (!admin.apps.length || !deviceToken) {
      console.log('Firebase not initialized or no device token provided');
      return null;
    }

    const message = {
      token: deviceToken,
      notification: {
        title: notification.title || 'New Post',
        body: notification.body || 'Check out a new post in your community',
      },
      data: {
        category: notification.category || 'general',
        postId: notification.postId || '',
        type: 'new_post',
        ...notification.data,
      },
      webpush: {
        fcmOptions: {
          link: notification.link || '/',
        },
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'community_connect',
        },
      },
      apns: {
        alert: {
          title: notification.title,
          body: notification.body,
        },
        sound: 'default',
      },
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error.message);
    return null;
  }
};

// Send notification to multiple devices
exports.sendMulticastNotification = async (deviceTokens, notification) => {
  try {
    if (!admin.apps.length || !deviceTokens || deviceTokens.length === 0) {
      console.log('Firebase not initialized or no device tokens provided');
      return null;
    }

    const message = {
      notification: {
        title: notification.title || 'New Post',
        body: notification.body || 'Check out a new post in your community',
      },
      data: {
        category: notification.category || 'general',
        postId: notification.postId || '',
        type: 'new_post',
        ...notification.data,
      },
      webpush: {
        fcmOptions: {
          link: notification.link || '/',
        },
      },
      android: {
        priority: 'high',
      },
    };

    const response = await admin.messaging().sendMulticast({
      tokens: deviceTokens,
      ...message,
    });

    console.log(`Sent ${response.successCount} notifications, ${response.failureCount} failed`);
    return response;
  } catch (error) {
    console.error('Error sending multicast notification:', error.message);
    return null;
  }
};

// Send notification to all subscribed users (except the post creator)
exports.sendNewPostNotification = async (post, excludeUserId) => {
  try {
    const User = require('../models/userModel');
    
    // Get all users except the one who created the post
    const users = await User.find({ _id: { $ne: excludeUserId } }).select('deviceTokens');
    
    if (!users || users.length === 0) {
      console.log('No users to notify');
      return null;
    }

    // Collect all device tokens
    const allTokens = [];
    users.forEach(user => {
      if (user.deviceTokens && user.deviceTokens.length > 0) {
        allTokens.push(...user.deviceTokens);
      }
    });

    if (allTokens.length === 0) {
      console.log('No device tokens found');
      return null;
    }

    // Send in batches of 500 (Firebase limit)
    const batchSize = 500;
    const results = [];

    for (let i = 0; i < allTokens.length; i += batchSize) {
      const batch = allTokens.slice(i, i + batchSize);
      const notification = {
        title: `New ${post.category} Post`,
        body: post.title || 'A new post has been shared in your community',
        category: post.category,
        postId: post._id.toString(),
        link: `/posts/${post._id}`,
        data: {
          userId: post.user.toString(),
          category: post.category,
        },
      };

      const result = await exports.sendMulticastNotification(batch, notification);
      if (result) {
        results.push(result);
      }
    }

    console.log('New post notifications sent to batches');
    return results;
  } catch (error) {
    console.error('Error sending new post notifications:', error.message);
    return null;
  }
};

// Send notification to users interested in a category
exports.sendCategoryNotification = async (post, category, excludeUserId) => {
  try {
    const User = require('../models/userModel');
    const Subscription = require('../models/subscriptionModel');

    // Get users subscribed to this category
    const subscriptions = await Subscription.find({ category });
    const userIds = subscriptions.map(sub => sub.userId);

    // Get users' device tokens
    const users = await User.find({
      _id: { $in: userIds, $ne: excludeUserId }
    }).select('deviceTokens');

    const allTokens = [];
    users.forEach(user => {
      if (user.deviceTokens && user.deviceTokens.length > 0) {
        allTokens.push(...user.deviceTokens);
      }
    });

    if (allTokens.length > 0) {
      const notification = {
        title: `New ${category} Post`,
        body: post.title || 'A post matching your interests has been shared',
        category: post.category,
        postId: post._id.toString(),
        link: `/posts/${post._id}`,
      };

      return exports.sendMulticastNotification(allTokens, notification);
    }
  } catch (error) {
    console.error('Error sending category notification:', error.message);
    return null;
  }
};

// Initialize Firebase on module load
initializeFirebase();

module.exports = exports;
