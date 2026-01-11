// src/routes/requestRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware.js');
const requestController = require('../controllers/requestController.js');

const router = express.Router();

// Create a new request (help or donation)
router.post('/', authMiddleware, requestController.createRequest);

// Get all requests for current user
router.get('/my-requests', authMiddleware, requestController.getUserRequests);

// Get a specific request
router.get('/:requestId', authMiddleware, requestController.getRequest);

// Update request status
router.put('/:requestId', authMiddleware, requestController.updateRequest);

// Get requests for a specific post
router.get('/post/:postId', requestController.getPostRequests);

module.exports = router;
