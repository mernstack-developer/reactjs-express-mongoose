const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Transaction details
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  
  enrollmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: false,
    index: true
  },
  
  // Payment information
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD']
  },
  
  // Payment method and transaction details
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'razorpay', 'cash', 'free'],
    default: 'stripe'
  },
  
  paymentProvider: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay', 'manual'],
    default: 'stripe'
  },
  
  transactionId: {
    type: String,
    required: false,
    index: true
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled', 'disputed'],
    default: 'pending',
    index: true
  },
  
  // Payment metadata
  paymentIntentId: {
    type: String,
    required: false
  },
  
  receiptUrl: {
    type: String,
    required: false
  },
  
  // Refund information
  refundedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  refundReason: {
    type: String,
    required: false
  },
  
  refundedAt: {
    type: Date,
    required: false
  },
  
  // Discount and promotion
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  couponCode: {
    type: String,
    required: false
  },
  
  // Financial settlement
  settledAt: {
    type: Date,
    required: false
  },
  
  settlementReference: {
    type: String,
    required: false
  },
  
  // Payout information (for instructors)
  payoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payout',
    default: null
  },
  
  instructorShare: {
    type: Number,
    default: 0,
    min: 0
  },
  
  platformFee: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'payments'
});

// Indexes for better query performance
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ courseId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 }, { unique: true });
paymentSchema.index({ paymentIntentId: 1 }, { unique: true });
paymentSchema.index({ userId: 1, status: 1 });

// Static methods for common queries
paymentSchema.statics = {
  // Get payments by user
  getUserPayments: function(userId, options = {}) {
    const query = { userId };
    if (options.status) query.status = options.status;
    return this.find(query)
      .populate('courseId', 'title instructor')
      .populate('userId', 'firstname lastname email')
      .sort({ createdAt: -1 });
  },
  
  // Get payments by course
  getCoursePayments: function(courseId, options = {}) {
    const query = { courseId };
    if (options.status) query.status = options.status;
    return this.find(query)
      .populate('userId', 'firstname lastname email')
      .populate('enrollmentId')
      .sort({ createdAt: -1 });
  },
  
  // Get revenue statistics for a course
  getCourseRevenue: function(courseId) {
    return this.aggregate([
      { $match: { courseId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalFees: { $sum: '$platformFee' },
          totalPayouts: { $sum: '$instructorShare' },
          transactionCount: { $sum: 1 },
          averageTransaction: { $avg: '$amount' }
        }
      }
    ]);
  },
  
  // Get instructor revenue
  getInstructorRevenue: function(instructorId, options = {}) {
    const matchStage = {
      'courseId.createdBy': instructorId,
      status: 'completed'
    };
    
    if (options.startDate) matchStage.createdAt = { $gte: options.startDate };
    if (options.endDate) {
      matchStage.createdAt = {
        ...matchStage.createdAt,
        $lte: options.endDate
      };
    }
    
    return this.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$instructorShare' },
          totalPlatformFees: { $sum: '$platformFee' },
          totalTransactions: { $sum: 1 },
          courses: { $addToSet: '$courseId' }
        }
      }
    ]);
  },
  
  // Get system-wide revenue
  getSystemRevenue: function(options = {}) {
    const matchStage = { status: 'completed' };
    
    if (options.startDate) matchStage.createdAt = { $gte: options.startDate };
    if (options.endDate) {
      matchStage.createdAt = {
        ...matchStage.createdAt,
        $lte: options.endDate
      };
    }
    
    return this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          dailyRevenue: { $sum: '$amount' },
          dailyFees: { $sum: '$platformFee' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }
};

// Instance methods
paymentSchema.methods = {
  // Mark payment as completed
  markCompleted: function(transactionId, receiptUrl) {
    this.status = 'completed';
    this.transactionId = transactionId;
    this.receiptUrl = receiptUrl;
    this.settledAt = new Date();
    return this.save();
  },
  
  // Mark payment as failed
  markFailed: function(failureReason) {
    this.status = 'failed';
    this.metadata.failureReason = failureReason;
    return this.save();
  },
  
  // Refund payment
  refund: function(amount, reason) {
    const refundAmount = amount || this.amount;
    if (refundAmount > this.amount - this.refundedAmount) {
      throw new Error('Refund amount exceeds available balance');
    }
    
    this.refundedAmount += refundAmount;
    this.refundReason = reason;
    this.refundedAt = new Date();
    
    if (this.refundedAmount >= this.amount) {
      this.status = 'refunded';
    }
    
    return this.save();
  },
  
  // Calculate net amount after fees
  getNetAmount: function() {
    return this.amount - this.platformFee;
  }
};

// Virtual for payment status
paymentSchema.virtual('isRefunded').get(function() {
  return this.status === 'refunded';
});

paymentSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

paymentSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);