const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All payment routes require authentication
router.use(authMiddleware);

// Payment routes
router.post('/create-intent', paymentController.createPaymentIntent);
router.post('/verify', paymentController.verifyPayment);
router.get('/status/:orderId', paymentController.getPaymentStatus);
router.post('/refund', paymentController.initiateRefund);

module.exports = router;