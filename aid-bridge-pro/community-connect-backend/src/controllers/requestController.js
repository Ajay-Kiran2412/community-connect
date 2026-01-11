// src/controllers/requestController.js
const Request = require('../models/requestModel.js');
const Post = require('../models/postModel.js');
const User = require('../models/userModel.js');
const notificationService = require('../services/notificationService.js');

// Create a new request
const createRequest = async (req, res) => {
  try {
    const { postId, requestType, phoneNumber, message, bloodType, quantity, address, hospital, preferredLocation } = req.body;
    const userId = req.user._id;

    console.log('--- Create Request ---');
    console.log('User ID:', userId);
    console.log('Request Body:', req.body);

    // Validate required fields
    if (!postId || !requestType || !phoneNumber) {
      console.error('Validation Error: Missing required fields.');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: postId, requestType, phoneNumber'
      });
    }

    // Validate blood type for donations
    if (requestType === 'donate' && !bloodType) {
      console.error('Validation Error: Blood type is required for donations.');
      return res.status(400).json({
        success: false,
        message: 'Blood type is required for donations'
      });
    }

    // Get the post
    console.log('Finding post with ID:', postId);
    const post = await Post.findById(postId).populate('user');
    if (!post) {
      console.error('Post not found for ID:', postId);
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    console.log('Found post:', post.title, 'by user:', post.user.name);

    // Prevent user from requesting their own post
    if (post.user._id.toString() === userId.toString()) {
      console.warn('User is attempting to request their own post. Aborting.');
      return res.status(400).json({
        success: false,
        message: 'You cannot request on your own post'
      });
    }

    // Create the request object
    const newRequestData = {
      postId,
      userId,
      postCreatorId: post.user._id,
      requestType,
      phoneNumber,
      message,
      bloodType,
      quantity,
      address,
      hospital,
      preferredLocation
    };
    console.log('Creating new request object with data:', newRequestData);
    const newRequest = new Request(newRequestData);

    await newRequest.save();
    console.log('Request saved successfully with ID:', newRequest._id);

    // Notify the post creator
    try {
      const postCreator = await User.findById(post.user._id);
      const requester = await User.findById(userId);

      if (postCreator && requester && postCreator.deviceTokens && postCreator.deviceTokens.length > 0) {
        console.log('Preparing to send notification to post creator:', postCreator.name);
        const notificationTitle = requestType === 'donate' 
          ? `🩸 Blood Donation: ${requester.name}` 
          : `🤝 Help Request: ${requester.name}`;
        
        const notificationBody = requestType === 'donate'
          ? `${requester.name} (${newRequest.bloodType}) has offered to donate!`
          : `${requester.name} has offered to help with your post!`;

        await notificationService.sendMulticastNotification(
          postCreator.deviceTokens,
          {
            title: notificationTitle,
            body: notificationBody,
            data: {
              postId: postId.toString(),
              requestId: newRequest._id.toString(),
              type: 'request'
            }
          }
        );
        console.log('Notification sent successfully.');
      } else {
        console.log('Skipping notification: Post creator or requester not found, or no device tokens available.');
      }
    } catch (notificationError) {
      console.error('Notification sending error:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      request: newRequest
    });
  } catch (error) {
    console.error('Error in createRequest function:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating request',
      error: error.message
    });
  }
};

// Get user's requests
const getUserRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, type } = req.query;

    let filter = {
      $or: [
        { userId },
        { postCreatorId: userId }
      ]
    };

    if (status) filter.status = status;
    if (type) filter.requestType = type;

    const requests = await Request.find(filter)
      .populate('postId', 'title category')
      .populate('userId', 'name avatar')
      .populate('postCreatorId', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message
    });
  }
};

// Get specific request
const getRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findById(requestId)
      .populate('postId')
      .populate('userId', 'name avatar email')
      .populate('postCreatorId', 'name avatar email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check authorization
    const userId = req.user._id.toString();
    if (request.userId.toString() !== userId && request.postCreatorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching request',
      error: error.message
    });
  }
};

// Update request status
const updateRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user._id;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Only post creator can update status
    if (request.postCreatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only post creator can update request status'
      });
    }

    if (status) request.status = status;
    if (notes) request.notes = notes;

    await request.save();

    // Notify requester about status update
    try {
      const requester = await User.findById(request.userId);
      if (requester.deviceTokens && requester.deviceTokens.length > 0) {
        const statusMessages = {
          contacted: '📞 We\'ve contacted the helper about your request!',
          confirmed: '✅ Your request is confirmed!',
          completed: '🎉 Your request is completed!',
          cancelled: '❌ Your request was cancelled'
        };

        await notificationService.sendMulticastNotification(
          requester.deviceTokens,
          {
            title: 'Request Update',
            body: statusMessages[status] || 'Your request status has been updated',
            data: {
              requestId: requestId.toString(),
              status,
              type: 'request_update'
            }
          }
        );
      }
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
    }

    res.json({
      success: true,
      message: 'Request updated successfully',
      request
    });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating request',
      error: error.message
    });
  }
};

// Get requests for a specific post
const getPostRequests = async (req, res) => {
  try {
    const { postId } = req.params;

    const requests = await Request.find({ postId })
      .populate('userId', 'name avatar phoneNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching post requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching post requests',
      error: error.message
    });
  }
};

module.exports = {
  createRequest,
  getUserRequests,
  getRequest,
  updateRequest,
  getPostRequests
};
