// src/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Don't send password back in queries by default
    },
    role: {
      type: String,
      enum: ['individual', 'ngo', 'organization'],
      required: [true, 'Role is required'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    badges: [
      {
        type: String,
        enum: ['verified', 'helper', 'life_saver', 'service'],
      },
    ],
  },
  { timestamps: true }
);

// --- Middleware to hash password before saving ---
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Method to compare passwords ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
