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

// Like/Unlike endpoints
router.post('/:id/like', postController.likePost);
router.post('/:id/unlike', postController.unlikePost);

// Share endpoint
router.post('/:id/share', postController.sharePost);

// Comments endpoints
router.get('/:id/comments', postController.getComments);
router.post('/:id/comments', postController.addComment);
router.delete('/:id/comments/:commentId', postController.deleteComment);

module.exports = router;