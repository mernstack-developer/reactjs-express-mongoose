const crypto = require('crypto');
const Cart = require('../models/cart.model');
const Course = require('../models/course.model');
const User = require('../models/user.model');
require('dotenv').config();

const razorpay = require('razorpay');

// Initialize Razorpay instance
const razorpayInstance = new razorpay({
  key_id: process.env.key_id || 'rzp_test_RhTy7BSRE89sGR',
  key_secret: process.env.key_secret || '0CimbUtYTOlNqDPnvy0JHu13'
});

// Validate Razorpay configuration
if (!process.env.key_id || !process.env.key_secret) {
  console.warn('Razorpay keys not found in environment variables, using default test keys');
}

// Create payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartId, paymentMethod } = req.body;

    console.log('Creating payment intent:', { userId, cartId, paymentMethod });

    if (!cartId) {
      return res.status(400).json({
        success: false,
        message: 'Cart ID is required'
      });
    }

    // Get cart with populated course details
    const cart = await Cart.findById(cartId)
      .populate({
        path: 'items.course',
        populate: {
          path: 'category',
          select: 'name'
        }
      });

    console.log('Cart found:', { cartExists: !!cart, userIdMatch: cart?.userId.toString() === userId, itemCount: cart?.items?.length });

    if (!cart || cart.userId.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate cart items have prices
    const invalidItems = cart.items.filter(item => !item.price || item.price <= 0);
    if (invalidItems.length > 0) {
      console.error('Invalid cart items with missing or zero prices:', invalidItems);
      return res.status(400).json({
        success: false,
        message: 'Cart contains items with invalid prices'
      });
    }

    // Calculate totals manually since cart might not have them pre-calculated
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price || 0), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    console.log('Cart totals calculated:', { subtotal, tax, total, itemCount: cart.items.length });

    const totalAmount = Math.round(total * 100); // Convert to paise and round
    const currency = 'INR'; // You can make this dynamic based on user preference

    console.log('Creating Razorpay order:', { totalAmount, currency });

    // Validate amount is positive
    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    // Create Razorpay order
    const order = await razorpayInstance.orders.create({
      amount: totalAmount,
      currency: currency,
      receipt: `order_${cartId.toString().slice(-10)}_${Date.now().toString().slice(-6)}`, // Keep receipt under 40 chars
      payment_capture: 1, // Auto capture payment
      notes: {
        cartId: cartId,
        userId: userId,
        courseIds: cart.items.map(item => item.course._id.toString()).join(',')
      }
    });

    // Store payment intent details
    const paymentIntent = {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      receipt: order.receipt,
      metadata: {
        userId: userId,
        cartId: cartId,
        courseIds: cart.items.map(item => item.course._id.toString())
      }
    };

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: razorpayInstance.key_id,
        cart: cart,
        paymentIntent: paymentIntent
      },
      message: 'Payment intent created successfully'
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Payment ID, and Signature are required'
      });
    }

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.key_secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Get the order details from Razorpay
    const order = await razorpayInstance.orders.fetch(orderId);
    
    if (order.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Get cart details
    const cart = await Cart.findById(order.notes.cartId)
      .populate('items.course');

    if (!cart || cart.userId.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Calculate totals for order data
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price || 0), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    // Create order record (you can create an Order model if needed)
    const orderData = {
      userId: userId,
      cartId: cart._id,
      paymentIntentId: orderId,
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      totalAmount: total,
      currency: 'INR',
      items: cart.items.map(item => ({
        course: item.course._id,
        price: item.price
      }))
    };

    // Enroll user in courses
    for (const item of cart.items) {
      const course = item.course;
      
      // Add user to course registeredUsers
      if (!course.registeredUsers.includes(userId)) {
        course.registeredUsers.push(userId);
        await course.save();
      }

      // Add course to user's registeredCourses
      const user = await User.findById(userId);
      if (user && !user.registeredCourses.includes(course._id.toString())) {
        user.registeredCourses.push(course._id.toString());
        await user.save();
      }
    }

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      data: orderData,
      message: 'Payment verified and courses enrolled successfully'
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await razorpayInstance.orders.fetch(orderId);
    
    res.json({
      success: true,
      data: order,
      message: 'Payment status retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};

// Refund payment
const initiateRefund = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const refund = await razorpayInstance.payments.refund(orderId, {
      amount: amount ? amount * 100 : null, // Convert to paise
      speed: 'optimum',
      notes: {
        reason: 'Customer requested refund'
      }
    });

    res.json({
      success: true,
      data: refund,
      message: 'Refund initiated successfully'
    });

  } catch (error) {
    console.error('Error initiating refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate refund',
      error: error.message
    });
  }
};

module.exports = {
  createPaymentIntent,
  verifyPayment,
  getPaymentStatus,
  initiateRefund
};