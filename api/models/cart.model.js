const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  addedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the updatedAt field
cartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for calculating subtotal
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => total + item.price, 0);
});

// Virtual for calculating tax (assuming 10%)
cartSchema.virtual('tax').get(function() {
  return this.subtotal * 0.1;
});

// Virtual for calculating total
cartSchema.virtual('total').get(function() {
  return this.subtotal + this.tax;
});

// Index for efficient querying by user
cartSchema.index({ userId: 1 });

module.exports = mongoose.model('Cart', cartSchema);