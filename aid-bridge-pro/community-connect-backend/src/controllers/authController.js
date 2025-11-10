// src/controllers/authController.js
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
  });
};

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  // maxAge set per-token when needed
});

// src/controllers/authController.js
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    console.log('Received signup data:', { name, email, role }); // Debug log

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    // Auto-verify option for development convenience
    const AUTO_VERIFY = process.env.AUTO_VERIFY === 'true';
    console.log('Auto verify enabled:', AUTO_VERIFY); // Debug log
    console.log('JWT Secret exists:', !!process.env.JWT_SECRET); // Debug log

    const newUser = await User.create({ 
      name, 
      email, 
      password, 
      role, 
      verified: AUTO_VERIFY 
    });

    console.log('User created successfully:', newUser._id); // Debug log

    // Don't send password back
    newUser.password = undefined;

    // If verified, set cookies AND return token in response
    if (newUser.verified) {
      const accessToken = signAccessToken(newUser._id);
      const refreshToken = signRefreshToken(newUser._id);
      
      console.log('Tokens generated for user:', newUser._id); // Debug log
      
      // Set HTTP-only cookies
      res.cookie('accessToken', accessToken, { ...cookieOptions(), maxAge: 1000 * 60 * 15 });
      res.cookie('refreshToken', refreshToken, { ...cookieOptions(), maxAge: 1000 * 60 * 60 * 24 * 7 });
      
      return res.status(201).json({ 
        status: 'success', 
        message: 'User registered and verified.', 
        data: { user: newUser },
        token: accessToken // Return token for localStorage
      });
    }

    res.status(201).json({ 
      status: 'success', 
      message: 'User registered. Please wait for verification.', 
      data: { user: newUser } 
    });
  } catch (error) {
    console.error('Signup error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    }); // Detailed debug log
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(error.errors).map(err => err.message).join(', ') });
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    if (!user.verified) {
      return res.status(403).json({ error: 'Account not verified. Please complete ID verification.' });
    }

    // Issue tokens and set cookies
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    
    // Set HTTP-only cookies
    res.cookie('accessToken', accessToken, { ...cookieOptions(), maxAge: 1000 * 60 * 15 });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions(), maxAge: 1000 * 60 * 60 * 24 * 7 });

    // Don't send password back
    user.password = undefined;
    
    res.status(200).json({ 
      status: 'success', 
      data: { user },
      token: accessToken // Return token for localStorage
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// Refresh endpoint: exchange refreshToken for new accessToken
exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'Invalid refresh token' });
    const newAccess = signAccessToken(user._id);
    res.cookie('accessToken', newAccess, { ...cookieOptions(), maxAge: 1000 * 60 * 15 });
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Logout: clear cookies
exports.logout = async (req, res, next) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ status: 'success' });
};

// Current user
exports.me = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(401).json({ error: 'Not authenticated' });
  }
};

// Development helper: verify a user account (requires ADMIN_TOKEN header)
exports.verifyUser = async (req, res, next) => {
  try {
    const adminToken = req.header('x-admin-token') || req.header('authorization');
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized: invalid admin token' });
    }

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Missing user id' });

    const user = await User.findByIdAndUpdate(id, { verified: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ status: 'success', message: 'User verified', data: { user } });
  } catch (error) {
    next(error);
  }
};
