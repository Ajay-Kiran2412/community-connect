// src/controllers/postController.js
const Post = require('../models/postModel');
const User = require('../models/userModel');
const notificationService = require('../services/notificationService');

// Create a new post
exports.createPost = async (req, res, next) => {
  try {
    const { title, description, category, postType, mediaUrl, mediaType, expiresAt } = req.body;
    
    console.log('Creating post with data:', { title, category, postType, user: req.user._id });

    if (!title || !category || !postType) {
      return res.status(400).json({ error: 'Title, category, and post type are required' });
    }

    // Set expiry for blood posts (5 hours from now)
    let postExpiresAt = expiresAt;
    if (category === 'blood' && !expiresAt) {
      postExpiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000);
    }

    const newPost = await Post.create({
      title,
      description,
      category,
      postType,
      user: req.user._id,
      mediaUrl,
      mediaType: mediaType || 'text',
      expiresAt: postExpiresAt,
    });

    // Populate user data for response
    await newPost.populate('user', 'name email role verified');

    // Send push notifications asynchronously (don't wait for it)
    try {
      notificationService.sendNewPostNotification(newPost, req.user._id)
        .then(result => {
          if (result) {
            console.log('Notifications sent for new post');
          }
        })
        .catch(error => {
          console.error('Error in notification service:', error);
        });
    } catch (notificationError) {
      console.error('Failed to send notifications:', notificationError);
      // Don't fail the post creation if notifications fail
    }

    res.status(201).json({
      status: 'success',
      message: 'Post created successfully',
      data: { post: newPost },
    });
  } catch (error) {
    console.error('Create post error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(error.errors).map(err => err.message).join(', ') });
    }
    next(error);
  }
};

// Get all posts (with filtering and pagination)
exports.getAllPosts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    
    // Build query
    let query = { status: 'active' };
    if (category && category !== 'all') {
      query.category = category;
    }

    const posts = await Post.find(query)
      .populate('user', 'name email role verified')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Update expired posts
    const now = new Date();
    for (let post of posts) {
      if (post.expiresAt && post.expiresAt < now && post.status === 'active') {
        post.status = 'expired';
        await post.save();
      }
    }

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: { posts },
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    next(error);
  }
};

// Get posts by current user
exports.getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .populate('user', 'name email role verified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: { posts },
    });
  } catch (error) {
    console.error('Get my posts error:', error);
    next(error);
  }
};

// Get single post by ID
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'name email role verified');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { post },
    });
  } catch (error) {
    console.error('Get post error:', error);
    next(error);
  }
};

// Update post
exports.updatePost = async (req, res, next) => {
  try {
    const { title, description, category, status } = req.body;
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    // Update fields
    if (title) post.title = title;
    if (description !== undefined) post.description = description;
    if (category) post.category = category;
    if (status) post.status = status;

    const updatedPost = await post.save();
    await updatedPost.populate('user', 'name email role verified');

    res.status(200).json({
      status: 'success',
      message: 'Post updated successfully',
      data: { post: updatedPost },
    });
  } catch (error) {
    console.error('Update post error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(error.errors).map(err => err.message).join(', ') });
    }
    next(error);
  }
};

// Delete post
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    next(error);
  }
};

// Like a post
exports.likePost = async (req, res, next) => {
  try {
    console.log('--- Like Post ---');
    console.log('Post ID:', req.params.id);
    console.log('User ID:', req.user._id);

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      console.error('Post not found for ID:', req.params.id);
      return res.status(404).json({ error: 'Post not found' });
    }
    console.log('Found post:', post.title);
    console.log('Initial likes:', post.likes);

    // Check if user already liked - convert to strings for comparison
    const userIdString = req.user._id.toString();
    const hasLiked = post.likes && post.likes.some(id => id.toString() === userIdString);
    console.log('User has already liked?', hasLiked);
    
    if (hasLiked) {
      console.warn('User has already liked this post. Aborting.');
      return res.status(400).json({ error: 'Already liked this post' });
    }

    if (!post.likes) {
      console.log('Likes array was null or undefined, initializing.');
      post.likes = [];
    }
    
    post.likes.push(req.user._id);
    console.log('Likes array after push:', post.likes);

    await post.save();
    console.log('Post saved successfully.');

    res.status(200).json({
      status: 'success',
      message: 'Post liked successfully',
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error('Like post error:', error);
    next(error);
  }
};

// Unlike a post
exports.unlikePost = async (req, res, next) => {
  try {
    console.log('Unlike request for post:', req.params.id, 'by user:', req.user._id);
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user has liked
    const userIdString = req.user._id.toString();
    const hasLiked = post.likes && post.likes.some(id => id.toString() === userIdString);
    
    if (!hasLiked) {
      return res.status(400).json({ error: 'Post not liked yet' });
    }

    post.likes = post.likes.filter(id => id.toString() !== userIdString);
    await post.save();
    console.log('Post unliked successfully. New likes count:', post.likes.length);

    res.status(200).json({
      status: 'success',
      message: 'Post unliked successfully',
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    next(error);
  }
};

// Share a post
exports.sharePost = async (req, res, next) => {
  try {
    console.log('Share request for post:', req.params.id, 'by user:', req.user._id);
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user already shared
    const userIdString = req.user._id.toString();
    const hasShared = post.shares && post.shares.some(id => id.toString() === userIdString);
    
    if (hasShared) {
      // Unlike likes, we don't need to return an error if already shared.
      // We can just return success.
      return res.status(200).json({
        status: 'success',
        message: 'Post share recorded',
        sharesCount: post.shares.length,
      });
    }

    if (!post.shares) {
      post.shares = [];
    }
    
    post.shares.push(req.user._id);
    await post.save();
    console.log('Post shared successfully. New shares count:', post.shares.length);

    res.status(200).json({
      status: 'success',
      message: 'Post shared successfully',
      sharesCount: post.shares.length,
    });
  } catch (error) {
    console.error('Share post error:', error);
    next(error);
  }
};


// Add comment to post
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    console.log('--- Add Comment ---');
    console.log('Post ID:', req.params.id);
    console.log('User ID:', req.user._id);
    console.log('Comment text:', text);
    
    if (!text || !text.trim()) {
      console.error('Comment text is missing.');
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      console.error('Post not found for ID:', req.params.id);
      return res.status(404).json({ error: 'Post not found' });
    }
    console.log('Found post:', post.title);

    const user = await User.findById(req.user._id);
    console.log('Found user:', user ? user.name : 'User not found');

    const comment = {
      userId: req.user._id,
      userName: user?.name || 'Anonymous',
      text: text.trim(),
      createdAt: new Date(),
    };
    console.log('Created comment object:', comment);

    if (!post.comments) {
      console.log('Comments array was null or undefined, initializing.');
      post.comments = [];
    }
    console.log('Initial comments array:', post.comments);

    post.comments.push(comment);
    console.log('Comments array after push:', post.comments);

    await post.save();
    console.log('Post saved successfully with new comment.');

    res.status(201).json({
      status: 'success',
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1], // Return the saved comment with its new _id
    });
  } catch (error) {
    console.error('Add comment error:', error);
    next(error);
  }
};


// Get comments for a post
exports.getComments = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({
      status: 'success',
      comments: post.comments || [],
    });
  } catch (error) {
    console.error('Get comments error:', error);
    next(error);
  }
};

// Delete comment from post
exports.deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.find(c => c._id.toString() === commentId);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    post.comments = post.comments.filter(c => c._id.toString() !== commentId);
    await post.save();

    res.status(200).json({
      status: 'success',
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    next(error);
  }
};