const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/status', authController.checkAuthStatus);
router.get('/profile',authMiddleware, authController.fetchProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/logout',authController.logout)
module.exports = router;
