const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  // Student information
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Course information
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  
  // Enrollment details
  enrollmentDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Enrollment status
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'suspended', 'pending'],
    default: 'active',
    index: true
  },
  
  // Course completion tracking
  isCompleted: {
    type: Boolean,
    default: false,
    index: true
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  // Progress tracking
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Time tracking
  timeSpent: {
    type: Number,
    default: 0, // Total time spent in seconds
  },
  
  // Payment information (for paid courses)
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'completed' // Most enrollments are free
  },
  
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  
  // Course access information
  accessExpiryDate: {
    type: Date,
    default: null // null means unlimited access
  },
  
  // Progress tracking
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  
  // Course feedback and ratings
  courseRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  
  courseReview: {
    type: String,
    default: null
  },
  
  // Instructor feedback
  instructorRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  
  // Certification
  certificateIssued: {
    type: Boolean,
    default: false
  },
  
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    default: null
  },
  
  // Enrollment source tracking
  enrollmentSource: {
    type: String,
    enum: ['direct', 'instructor_invitation', 'admin_approval', 'bulk_upload', 'api'],
    default: 'direct'
  },
  
  // Notes and comments (for admin/instructor use)
  notes: {
    type: String,
    default: null
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Who created this enrollment (admin/instructor)
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
  collection: 'enrollments'
});

// Indexes for better query performance
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true }); // One enrollment per student per course
enrollmentSchema.index({ courseId: 1, status: 1 });
enrollmentSchema.index({ studentId: 1, status: 1 });
enrollmentSchema.index({ enrollmentDate: 1 });
enrollmentSchema.index({ isCompleted: 1, completedAt: 1 });
enrollmentSchema.index({ courseRating: 1 });
enrollmentSchema.index({ instructorRating: 1 });

// Static methods for common queries
enrollmentSchema.statics = {
  // Get enrollments by course with student info
  getCourseEnrollments: function(courseId) {
    return this.find({ courseId })
      .populate('studentId', 'firstname lastname email avatarUrl')
      .sort({ enrollmentDate: -1 });
  },
  
  // Get enrollments by student with course info
  getStudentEnrollments: function(studentId) {
    return this.find({ studentId })
      .populate('courseId', 'title thumbnail instructor createdBy')
      .sort({ enrollmentDate: -1 });
  },
  
  // Get course completion statistics
  getCourseStats: function(courseId) {
    return this.aggregate([
      { $match: { courseId: courseId } },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          activeEnrollments: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedEnrollments: {
            $sum: { $cond: ['$isCompleted', 1, 0] }
          },
          droppedEnrollments: {
            $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] }
          },
          averageCompletionTime: {
            $avg: {
              $cond: {
                if: { $gt: ['$completedAt', null] },
                then: { $subtract: ['$completedAt', '$enrollmentDate'] },
                else: null
              }
            }
          },
          averageRating: { $avg: '$courseRating' }
        }
      }
    ]);
  },
  
  // Get instructor statistics
  getInstructorStats: function(instructorId) {
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
      { $match: { 'course.createdBy': instructorId } },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          totalCourses: { $addToSet: '$courseId' },
          totalCompletions: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          totalRevenue: { $sum: '$paymentAmount' },
          averageRating: { $avg: '$courseRating' }
        }
      }
    ]);
  },
  
  // Get system-wide statistics
  getSystemStats: function() {
    return this.aggregate([
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          activeEnrollments: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedEnrollments: {
            $sum: { $cond: ['$isCompleted', 1, 0] }
          },
          completionRate: {
            $avg: '$completionPercentage'
          }
        }
      }
    ]);
  }
};

// Instance methods
enrollmentSchema.methods = {
  // Update completion status
  markCompleted: function() {
    this.isCompleted = true;
    this.completedAt = new Date();
    this.status = 'completed';
    return this.save();
  },
  
  // Update progress
  updateProgress: function(percentage, timeSpent) {
    this.completionPercentage = Math.min(100, Math.max(0, percentage));
    this.timeSpent += timeSpent || 0;
    this.lastActivityAt = new Date();
    return this.save();
  },
  
  // Leave course
  dropCourse: function(reason) {
    this.status = 'dropped';
    this.notes = reason || 'No reason provided';
    return this.save();
  },
  
  // Reactivate enrollment
  reactivate: function() {
    this.status = 'active';
    this.notes = null;
    return this.save();
  }
};

// Pre-save middleware
enrollmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for completion status
enrollmentSchema.virtual('completionStatus').get(function() {
  if (this.isCompleted) return 'completed';
  if (this.status === 'dropped') return 'dropped';
  if (this.completionPercentage >= 90) return 'near_completion';
  if (this.completionPercentage >= 50) return 'in_progress';
  return 'just_started';
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
