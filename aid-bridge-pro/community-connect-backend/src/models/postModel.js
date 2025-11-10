// src/models/postModel.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['blood', 'food', 'clothes', 'books', 'blankets', 'general', 'community_service', 'achievement'],
    },
    postType: {
      type: String,
      required: [true, 'Post type is required'],
      enum: ['needy', 'organization'],
      default: 'needy',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    mediaUrl: {
      type: String,
      required: false,
    },
    mediaType: {
      type: String,
      enum: ['text', 'image', 'video'],
      default: 'text',
    },
    status: {
      type: String,
      enum: ['active', 'fulfilled', 'expired'],
      default: 'active',
    },
    expiresAt: {
      type: Date,
      required: false,
    },
    location: {
      latitude: { type: Number, required: false },
      longitude: { type: Number, required: false },
    },
  },
  { timestamps: true }
);

// Index for better query performance
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ category: 1, status: 1 });
postSchema.index({ expiresAt: 1 });

// Method to check if post is expired
postSchema.methods.isExpired = function() {
  if (this.expiresAt) {
    return new Date() > this.expiresAt;
  }
  return false;
};

// Middleware to update status if expired
postSchema.pre('save', function(next) {
  if (this.isExpired() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);