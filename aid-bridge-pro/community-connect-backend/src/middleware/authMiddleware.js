const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

module.exports = async function protect(req, res, next) {
  try {
    const token = req.cookies?.accessToken || (req.header('authorization')?.startsWith('Bearer ') ? req.header('authorization').split(' ')[1] : null);
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
