// src/models/requestModel.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    postCreatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestType: {
      type: String,
      enum: ['help', 'donate'],
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    message: {
      type: String
    },
    // For donations
    bloodType: {
      type: String,
      enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
    },
    quantity: {
      type: String
    },
    // Location & Hospital Details
    address: {
      type: String
    },
    hospital: {
      type: String
    },
    preferredLocation: {
      type: String
    },
    // Status tracking
    status: {
      type: String,
      enum: ['pending', 'contacted', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

// Index for faster queries
requestSchema.index({ postId: 1 });
requestSchema.index({ userId: 1 });
requestSchema.index({ postCreatorId: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ createdAt: -1 });

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
