// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

// --- Core Middlewares ---
// CORS: allow the frontend origin (set FRONTEND_URL in env) and allow credentials for cookies
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- API Routes ---
// --- API Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoute'));
app.use('/api/requests', require('./routes/requestRoutes'));

// --- Root Route for Health Check ---
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Community Connect API is running!' });
});

// --- 404 Handler ---
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// --- Global Error Handler ---
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;