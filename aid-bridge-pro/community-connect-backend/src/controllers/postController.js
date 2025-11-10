// src/controllers/postController.js
const Post = require('../models/postModel');
const User = require('../models/userModel');

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