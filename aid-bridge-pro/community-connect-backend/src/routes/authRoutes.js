// src/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify/:id', authController.verifyUser);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);
router.post('/device-token', protect, authController.saveDeviceToken);
router.delete('/device-token', protect, authController.removeDeviceToken);

module.exports = router;
