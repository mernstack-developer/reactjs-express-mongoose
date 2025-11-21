const mongoose = require('mongoose');
const Course = require('../models/course.model');
const User = require('../models/user.model');
const Enrollment = require('../models/enrollment.model');
const Payment = require('../models/payment.model');
const Role = require('../models/role.model');
const Permission = require('../models/permission.model');

// Get admin dashboard data
async function getDashboardData(req, res) {
  try {
    // Get system statistics using aggregation
    const [systemStats] = await Enrollment.getSystemStats();
    const stats = systemStats || {
      totalEnrollments: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      completionRate: 0
    };
    
    // Get additional system statistics
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalInstructors = await User.countDocuments({ role: { $exists: true } });
    
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get recent activity
    const recentUsers = await User.find()
      .populate('role')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const recentCourses = await Course.find()
      .populate('createdBy')
      .populate('category')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const recentEnrollments = await Enrollment.find()
      .populate('studentId', 'firstname lastname email')
      .populate('courseId', 'title')
      .sort({ enrollmentDate: -1 })
      .limit(10);
    
    // Get approval pending items
    const pendingCourses = await Course.find({ status: 'pending' })
      .populate('createdBy')
      .limit(10);
    
    const pendingPayments = await Payment.find({ status: 'pending' })
      .populate('userId', 'firstname lastname email')
      .limit(10);
    
    // Get enrollment trends for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const enrollmentTrends = await Enrollment.aggregate([
      {
        $match: {
          enrollmentDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$enrollmentDate'
            }
          },
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get course completion trends
    const completionTrends = await Enrollment.aggregate([
      {
        $match: {
          isCompleted: true,
          completedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$completedAt'
            }
          },
          completions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalCourses,
          totalInstructors,
          totalEnrollments: stats.totalEnrollments || 0,
          activeEnrollments: stats.activeEnrollments || 0,
          completedEnrollments: stats.completedEnrollments || 0,
          completionRate: Math.round(stats.completionRate || 0),
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentActivity: {
          recentUsers,
          recentCourses,
          recentEnrollments
        },
        pendingItems: {
          pendingCourses,
          pendingPayments
        },
        trends: {
          enrollmentTrends,
          completionTrends
        }
      }
    });
  } catch (error) {
    console.error('Get admin dashboard data error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get system analytics
async function getSystemAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }
    
    // User growth analytics
    const userGrowth = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Course analytics
    const courseAnalytics = await Course.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          coursesCreated: { $sum: 1 },
          coursesPublished: { 
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } 
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Enrollment analytics
    const enrollmentAnalytics = await Enrollment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Revenue analytics
    const revenueAnalytics = await Payment.aggregate([
      { $match: { ...matchStage, status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        userGrowth,
        courseAnalytics,
        enrollmentAnalytics,
        revenueAnalytics
      }
    });
  } catch (error) {
    console.error('Get system analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get all users
async function getUsers(req, res) {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .populate('role')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get all courses
async function getAllCourses(req, res) {
  try {
    const { status, category, instructor, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (instructor) query.createdBy = instructor;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const courses = await Course.find(query)
      .populate('createdBy')
      .populate('category')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Course.countDocuments(query);
    
    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get courses pending approval
async function getCoursesPendingApproval(req, res) {
  try {
    const courses = await Course.find({ status: 'pending' })
      .populate('createdBy')
      .populate('category')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get courses pending approval error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Approve course
async function approveCourse(req, res) {
  try {
    const { courseId } = req.params;
    const course = await Course.findByIdAndUpdate(
      courseId,
      { 
        status: 'published',
        approvedAt: new Date(),
        approvedBy: req.user.id
      },
      { new: true }
    ).populate('createdBy');
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Notify instructor
    await sendCourseApprovalNotification(course.createdBy._id, course, 'approved');
    
    res.json({ success: true, data: course });
  } catch (error) {
    console.error('Approve course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Reject course
async function rejectCourse(req, res) {
  try {
    const { courseId } = req.params;
    const { reason } = req.body;
    
    const course = await Course.findByIdAndUpdate(
      courseId,
      { 
        status: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: req.user.id,
        rejectionReason: reason
      },
      { new: true }
    ).populate('createdBy');
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Notify instructor
    await sendCourseApprovalNotification(course.createdBy._id, course, 'rejected', reason);
    
    res.json({ success: true, data: course });
  } catch (error) {
    console.error('Reject course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get all enrollments
async function getEnrollments(req, res) {
  try {
    const { status, courseId, studentId, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (courseId) query.courseId = courseId;
    if (studentId) query.studentId = studentId;
    
    const enrollments = await Enrollment.find(query)
      .populate('studentId')
      .populate('courseId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Enrollment.countDocuments(query);
    
    res.json({
      success: true,
      data: enrollments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get system statistics
async function getSystemStats(req, res) {
  try {
    // Get enrollment statistics using aggregation
    const [enrollmentStats] = await Enrollment.getSystemStats();
    
    const stats = {
      users: {
        total: await User.countDocuments(),
        active: await User.countDocuments({ status: 'active' }),
        inactive: await User.countDocuments({ status: 'inactive' })
      },
      courses: {
        total: await Course.countDocuments(),
        published: await Course.countDocuments({ status: 'published' }),
        pending: await Course.countDocuments({ status: 'pending' }),
        rejected: await Course.countDocuments({ status: 'rejected' })
      },
      enrollments: {
        total: enrollmentStats?.totalEnrollments || await Enrollment.countDocuments(),
        active: enrollmentStats?.activeEnrollments || await Enrollment.countDocuments({ status: 'active' }),
        completed: enrollmentStats?.completedEnrollments || await Enrollment.countDocuments({ isCompleted: true }),
        completionRate: Math.round(enrollmentStats?.completionRate || 0)
      },
      revenue: {
        total: await Payment.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(result => result[0]?.total || 0),
        pending: await Payment.aggregate([
          { $match: { status: 'pending' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(result => result[0]?.total || 0)
      }
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Helper function to send course approval notification
async function sendCourseApprovalNotification(userId, course, status, reason = null) {
  try {
    // This would integrate with your notification system
    // For now, just log the notification
    console.log(`Course ${status}: ${course.title} for user ${userId}`);
    if (reason) {
      console.log(`Rejection reason: ${reason}`);
    }
  } catch (error) {
    console.error('Send notification error:', error);
  }
}

module.exports = {
  getDashboardData,
  getSystemAnalytics,
  getUsers,
  getAllCourses,
  getCoursesPendingApproval,
  approveCourse,
  rejectCourse,
  getEnrollments,
  getSystemStats
};