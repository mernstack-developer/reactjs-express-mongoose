const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All cart routes require authentication
router.use(authMiddleware);

// Cart routes
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.delete('/remove/:itemId', cartController.removeFromCart);
router.put('/update/:itemId', cartController.updateCartItem);
router.delete('/clear', cartController.clearCart);

module.exports = router;