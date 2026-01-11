// src/services/firebaseMessaging.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import axios from 'axios';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let messaging: any = null;
let isNotificationSupported = false;

export const initializeMessaging = async () => {
  try {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers are not supported in this browser');
      return false;
    }

    // Check if Firebase config is complete
    if (!firebaseConfig.projectId) {
      console.warn('Firebase configuration is not complete');
      return false;
    }

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);

    // Register the service worker
    await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered successfully');
    isNotificationSupported = true;
    return true;
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
    return false;
  }
};

export const requestNotificationPermission = async () => {
  try {
    if (!isNotificationSupported) {
      console.warn('Notifications are not supported');
      return null;
    }

    // Request permission from user
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted');
      return await getDeviceToken();
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

export const getDeviceToken = async () => {
  try {
    if (!messaging) {
      console.warn('Firebase Messaging is not initialized');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || '',
    });

    if (token) {
      console.log('Device token:', token);
      // Send token to backend
      await saveDeviceTokenToBackend(token);
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting device token:', error);
    return null;
  }
};

export const saveDeviceTokenToBackend = async (deviceToken: string) => {
  try {
    await axios.post('/auth/device-token', {
      deviceToken,
    });
    console.log('Device token saved to backend');
  } catch (error) {
    console.error('Error saving device token to backend:', error);
  }
};

export const removeDeviceTokenFromBackend = async (deviceToken: string) => {
  try {
    await axios.delete('/auth/device-token', {
      data: { deviceToken },
    });
    console.log('Device token removed from backend');
  } catch (error) {
    console.error('Error removing device token from backend:', error);
  }
};

export const setupMessageListener = (onMessageCallback: (message: any) => void) => {
  try {
    if (!messaging) {
      console.warn('Firebase Messaging is not initialized');
      return;
    }

    // Handle messages when the app is in the foreground
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      onMessageCallback(payload);
    });
  } catch (error) {
    console.error('Error setting up message listener:', error);
  }
};

export { messaging };
