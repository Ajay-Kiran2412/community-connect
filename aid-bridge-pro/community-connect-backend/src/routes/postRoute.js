// src/routes/postRoutes.js
const express = require('express');
const postController = require('../controllers/postController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

router.post('/', postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/my-posts', postController.getMyPosts);
router.get('/:id', postController.getPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

module.exports = router;