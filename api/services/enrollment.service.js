const Enrollment = require('../models/enrollment.model');
const Course = require('../models/course.model');
const User = require('../models/user.model');

// Create a new enrollment
async function createEnrollment(studentId, courseId, enrollmentData = {}) {
  try {
    // Check if student is already enrolled in this course
    const existingEnrollment = await Enrollment.findOne({
      studentId,
      courseId
    });
    
    if (existingEnrollment) {
      throw new Error('Student is already enrolled in this course');
    }
    
    // Verify course exists and is active
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Verify student exists
    const student = await User.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }
    
    // Create enrollment
    const enrollment = new Enrollment({
      studentId,
      courseId,
      enrollmentDate: new Date(),
      status: 'active',
      enrollmentSource: enrollmentData.source || 'direct',
      createdBy: enrollmentData.createdBy || studentId
    });
    
    await enrollment.save();
    
    // Populate references for return
    await enrollment.populate('studentId', 'firstname lastname email');
    await enrollment.populate('courseId', 'title instructor');
    
    return enrollment;
  } catch (error) {
    throw error;
  }
}

// Get enrollment by IDs
async function getEnrollment(studentId, courseId) {
  try {
    const enrollment = await Enrollment.findOne({ studentId, courseId })
      .populate('studentId', 'firstname lastname email avatarUrl')
      .populate('courseId', 'title thumbnail instructor createdBy category')
      .populate('paymentId')
      .populate('certificateId');
    
    return enrollment;
  } catch (error) {
    throw error;
  }
}

// Update enrollment status
async function updateEnrollmentStatus(enrollmentId, status, reason = null) {
  try {
    const validStatuses = ['active', 'completed', 'dropped', 'suspended', 'pending'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid enrollment status');
    }
    
    const updates = { status };
    
    if (reason) {
      updates.notes = reason;
    }
    
    if (status === 'completed') {
      updates.isCompleted = true;
      updates.completedAt = new Date();
    } else if (status === 'dropped' || status === 'suspended') {
      updates.isCompleted = false;
      updates.completedAt = null;
    }
    
    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      updates,
      { new: true }
    )
    .populate('studentId', 'firstname lastname email')
    .populate('courseId', 'title');
    
    return enrollment;
  } catch (error) {
    throw error;
  }
}

// Update course progress
async function updateProgress(studentId, courseId, completionPercentage, timeSpent = 0) {
  try {
    const enrollment = await Enrollment.findOneAndUpdate(
      { studentId, courseId },
      {
        completionPercentage: Math.min(100, Math.max(0, completionPercentage)),
        timeSpent: timeSpent,
        lastActivityAt: new Date()
      },
      { new: true }
    );
    
    return enrollment;
  } catch (error) {
    throw error;
  }
}

// Mark course as completed
async function markCourseCompleted(studentId, courseId, courseRating = null, instructorRating = null) {
  try {
    const enrollment = await Enrollment.findOneAndUpdate(
      { studentId, courseId },
      {
        isCompleted: true,
        completedAt: new Date(),
        courseRating: courseRating,
        instructorRating: instructorRating,
        status: 'completed'
      },
      { new: true }
    )
    .populate('studentId', 'firstname lastname email')
    .populate('courseId', 'title instructor');
    
    return enrollment;
  } catch (error) {
    throw error;
  }
}

// Get student's enrollments
async function getStudentEnrollments(studentId, filters = {}) {
  try {
    const query = { studentId };
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.courseId) {
      query.courseId = filters.courseId;
    }
    
    const enrollments = await Enrollment.find(query)
      .populate('courseId', 'title thumbnail instructor createdBy category totalDuration')
      .populate('studentId', 'firstname lastname email')
      .sort({ enrollmentDate: -1 });
    
    return enrollments;
  } catch (error) {
    throw error;
  }
}

// Get course enrollments
async function getCourseEnrollments(courseId, filters = {}) {
  try {
    const query = { courseId };
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    const enrollments = await Enrollment.find(query)
      .populate('studentId', 'firstname lastname email avatarUrl')
      .populate('courseId', 'title thumbnail')
      .sort({ enrollmentDate: -1 });
    
    return enrollments;
  } catch (error) {
    throw error;
  }
}

// Get enrollment statistics for a course
async function getCourseStatistics(courseId) {
  try {
    const [stats] = await Enrollment.getCourseStats(courseId);
    
    if (!stats) {
      return {
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        droppedEnrollments: 0,
        completionRate: 0,
        averageCompletionTime: 0,
        averageRating: 0
      };
    }
    
    // Convert average completion time from milliseconds to days
    const avgCompletionTimeDays = stats.averageCompletionTime 
      ? Math.round(stats.averageCompletionTime / (1000 * 60 * 60 * 24))
      : 0;
    
    return {
      ...stats,
      averageCompletionTimeDays
    };
  } catch (error) {
    throw error;
  }
}

// Get instructor statistics
async function getInstructorStatistics(instructorId) {
  try {
    const [stats] = await Enrollment.getInstructorStats(instructorId);
    
    if (!stats) {
      return {
        totalStudents: 0,
        totalCourses: [],
        totalCompletions: 0,
        totalRevenue: 0,
        averageRating: 0
      };
    }
    
    return {
      ...stats,
      totalCoursesCount: stats.totalCourses.length
    };
  } catch (error) {
    throw error;
  }
}

// Get system-wide enrollment statistics
async function getSystemStatistics() {
  try {
    const [stats] = await Enrollment.getSystemStats();
    
    if (!stats) {
      return {
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        completionRate: 0
      };
    }
    
    return stats;
  } catch (error) {
    throw error;
  }
}

// Delete enrollment
async function deleteEnrollment(studentId, courseId) {
  try {
    const enrollment = await Enrollment.findOneAndDelete({
      studentId,
      courseId
    });
    
    return enrollment;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createEnrollment,
  getEnrollment,
  updateEnrollmentStatus,
  updateProgress,
  markCourseCompleted,
  getStudentEnrollments,
  getCourseEnrollments,
  getCourseStatistics,
  getInstructorStatistics,
  getSystemStatistics,
  deleteEnrollment
};