const Cart = require('../models/cart.model');
const Course = require('../models/course.model');
const User = require('../models/user.model');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let cart = await Cart.findOne({ userId })
      .populate({
        path: 'items.course',
        populate: {
          path: 'category',
          select: 'name'
        }
      });

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    // Calculate totals manually since virtuals don't serialize
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price || 0), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    // Add totals to response
    const cartWithTotals = {
      ...cart.toObject(),
      subtotal,
      tax,
      total
    };

    res.json({
      success: true,
      data: cartWithTotals,
      message: 'Cart retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

// Add course to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    // Check if course exists and is paid
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.enrollmentType !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This course is not available for purchase'
      });
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if course already in cart
    const existingItem = cart.items.find(item => item.course.toString() === courseId);
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Course already in cart'
      });
    }

    // Add course to cart
    cart.items.push({
      course: courseId,
      price: course.price || 0
    });

    await cart.save();
    await cart.populate({
      path: 'items.course',
      populate: {
        path: 'category',
        select: 'name'
      }
    });

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price || 0), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const cartWithTotals = {
      ...cart.toObject(),
      subtotal,
      tax,
      total
    };

    res.json({
      success: true,
      data: cartWithTotals,
      message: 'Course added to cart successfully'
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add course to cart',
      error: error.message
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Check if item exists in cart
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Remove item
    cart.items.splice(itemIndex, 1);
    await cart.save();
    await cart.populate({
      path: 'items.course',
      populate: {
        path: 'category',
        select: 'name'
      }
    });

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price || 0), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const cartWithTotals = {
      ...cart.toObject(),
      subtotal,
      tax,
      total
    };

    res.json({
      success: true,
      data: cartWithTotals,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

// Update cart item (future use for quantity if needed)
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.find(item => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // For now, we don't support quantity for courses
    res.json({
      success: true,
      data: cart,
      message: 'Cart item updated successfully'
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    // Calculate totals (will be 0)
    const subtotal = 0;
    const tax = 0;
    const total = 0;

    const cartWithTotals = {
      ...cart.toObject(),
      subtotal,
      tax,
      total
    };

    res.json({
      success: true,
      data: cartWithTotals,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart
};