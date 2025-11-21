const mongoose = require('mongoose');
const Course = require('../models/course.model');
const Section = require('../models/section.model');
const User = require('../models/user.model');
const Enrollment = require('../models/enrollment.model');
const Assignment = require('../models/assignment.model');
const Submission = require('../models/submission.model');
const SectionProgress = require('../models/section.model').SectionProgress;
const Certificate = require('../models/certificate.model');

// Get instructor dashboard data
async function getDashboardData(req, res) {
  try {
    const instructorId = req.user.id;
    
    // Get courses taught by instructor
    const courses = await Course.find({ createdBy: instructorId })
      .populate('category')
      .populate({
        path: 'sections',
        populate: {
          path: 'activities'
        }
      });
    
    // Get student count
    const studentCount = await Enrollment.countDocuments({
      courseId: { $in: courses.map(c => c._id) },
      status: 'active'
    });
    
    // Get recent enrollments
    const recentEnrollments = await Enrollment.find({
      courseId: { $in: courses.map(c => c._id) }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('studentId')
    .populate('courseId');
    
    // Get completion stats
    const completionStats = await getCourseCompletionStats(instructorId);
    
    res.json({
      success: true,
      data: {
        totalCourses: courses.length,
        totalStudents: studentCount,
        recentEnrollments,
        completionStats,
        courses: courses.map(course => ({
          _id: course._id,
          title: course.title,
          studentsCount: course.studentsCount || 0,
          completionRate: course.completionRate || 0,
          revenue: course.revenue || 0
        }))
      }
    });
  } catch (error) {
    console.error('Get instructor dashboard data error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get courses taught by instructor
async function getMyCourses(req, res) {
  try {
    const instructorId = req.user.id;
    const { status, category } = req.query;
    
    const query = { createdBy: instructorId };
    if (status) query.status = status;
    if (category) query.category = category;
    
    const courses = await Course.find(query)
      .populate('category')
      .populate({
        path: 'sections',
        populate: {
          path: 'activities'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get course analytics
async function getCourseAnalytics(req, res) {
  try {
    const { courseId } = req.params;
    const instructorId = req.user.id;
    
    // Verify instructor owns the course
    const course = await Course.findOne({ _id: courseId, createdBy: instructorId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Get enrollment statistics using aggregation
    const [enrollmentStats] = await Enrollment.getCourseStats(courseId);
    const enrollmentStatsData = enrollmentStats || {
      totalEnrollments: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      droppedEnrollments: 0,
      averageCompletionTime: 0,
      averageRating: 0
    };
    
    // Get detailed enrollment data
    const enrollments = await Enrollment.getCourseEnrollments(courseId);
    
    // Get progress data
    const progressData = await SectionProgress.aggregate([
      {
        $match: {
          sectionId: { $in: course.sections || [] }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalTime: { $sum: '$timeSpent' },
          completedSections: { 
            $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] }
          },
          totalDurationWatched: { $sum: '$durationWatched' }
        }
      }
    ]);
    
    // Get completion trends over time
    const completionTrends = await Enrollment.aggregate([
      {
        $match: {
          courseId: courseId,
          isCompleted: true,
          completedAt: { $ne: null }
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
    
    // Get rating distribution
    const ratingDistribution = await Enrollment.aggregate([
      {
        $match: {
          courseId: courseId,
          courseRating: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$courseRating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        course,
        stats: enrollmentStatsData,
        enrollments,
        progressData,
        completionTrends,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Get course analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get students enrolled in instructor's courses
async function getMyStudents(req, res) {
  try {
    const instructorId = req.user.id;
    const { courseId, search } = req.query;
    
    const courseQuery = { createdBy: instructorId };
    if (courseId) courseQuery._id = courseId;
    
    const courses = await Course.find(courseQuery);
    const courseIds = courses.map(c => c._id);
    
    const enrollmentQuery = { courseId: { $in: courseIds } };
    if (search) {
      enrollmentQuery.$or = [
        { 'studentId.firstname': { $regex: search, $options: 'i' } },
        { 'studentId.lastname': { $regex: search, $options: 'i' } },
        { 'studentId.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    const enrollments = await Enrollment.find(enrollmentQuery)
      .populate('studentId', 'firstname lastname email avatarUrl')
      .populate('courseId', 'title thumbnail')
      .sort({ enrollmentDate: -1 });
    
    // Group by student
    const studentsMap = new Map();
    enrollments.forEach(enrollment => {
      const studentId = enrollment.studentId._id.toString();
      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          ...enrollment.studentId._doc,
          courses: [],
          totalCourses: 0,
          completedCourses: 0,
          totalCompletionPercentage: 0
        });
      }
      const student = studentsMap.get(studentId);
      student.courses.push({
        courseId: enrollment.courseId._id,
        courseTitle: enrollment.courseId.title,
        courseThumbnail: enrollment.courseId.thumbnail,
        enrolledAt: enrollment.enrollmentDate,
        completedAt: enrollment.isCompleted ? enrollment.completedAt : null,
        status: enrollment.status,
        completionPercentage: enrollment.completionPercentage,
        timeSpent: enrollment.timeSpent,
        lastActivity: enrollment.lastActivityAt
      });
      student.totalCourses++;
      if (enrollment.isCompleted) student.completedCourses++;
      student.totalCompletionPercentage += enrollment.completionPercentage;
    });
    
    // Calculate average completion percentage
    const students = Array.from(studentsMap.values()).map(student => ({
      ...student,
      averageCompletionPercentage: student.totalCourses > 0 
        ? Math.round(student.totalCompletionPercentage / student.totalCourses) 
        : 0
    }));
    
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('Get my students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get course progress for all students
async function getCourseProgress(req, res) {
  try {
    const { courseId } = req.params;
    const instructorId = req.user.id;
    
    // Verify instructor owns the course
    const course = await Course.findOne({ _id: courseId, createdBy: instructorId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const enrollments = await Enrollment.find({ courseId })
      .populate('studentId', 'firstname lastname email avatarUrl')
      .sort({ enrollmentDate: -1 });
    
    const progressData = [];
    for (const enrollment of enrollments) {
      const sectionProgress = await getCourseProgressForStudent(enrollment.studentId._id, courseId);
      
      progressData.push({
        student: enrollment.studentId,
        enrollment: {
          enrollmentDate: enrollment.enrollmentDate,
          completionDate: enrollment.completedAt,
          status: enrollment.status,
          isCompleted: enrollment.isCompleted,
          completionPercentage: enrollment.completionPercentage,
          timeSpent: enrollment.timeSpent,
          lastActivity: enrollment.lastActivityAt,
          courseRating: enrollment.courseRating,
          instructorRating: enrollment.instructorRating
        },
        progress: sectionProgress,
        certificateIssued: enrollment.certificateIssued,
        notes: enrollment.notes
      });
    }
    
    res.json({ success: true, data: progressData });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Helper function to get course completion stats
async function getCourseCompletionStats(instructorId, courseId = null) {
  const query = { createdBy: instructorId };
  if (courseId) query._id = courseId;
  
  const courses = await Course.find(query);
  const courseIds = courses.map(c => c._id);
  
  const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
  const totalEnrollments = enrollments.length;
  const completedEnrollments = enrollments.filter(e => e.isCompleted).length;
  const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
  
  return {
    totalEnrollments,
    completedEnrollments,
    inProgressEnrollments: totalEnrollments - completedEnrollments,
    completionRate: Math.round(completionRate)
  };
}

// Helper function to get course progress for a specific student
async function getCourseProgressForStudent(userId, courseId) {
  const course = await Course.findById(courseId).populate('sections');
  if (!course) throw new Error('Course not found');
  
  const sections = course.sections || [];
  let totalTimeSpent = 0;
  let totalDurationWatched = 0;
  let completedSections = 0;
  let lastActivity = null;
  
  for (const section of sections) {
    const progress = await SectionProgress.findOne({ 
      userId, 
      sectionId: section._id 
    }).sort({ lastActivityAt: -1 });
    
    if (progress) {
      totalTimeSpent += progress.timeSpent;
      totalDurationWatched += progress.durationWatched;
      if (progress.isCompleted) {
        completedSections++;
      }
      if (!lastActivity || new Date(progress.lastActivityAt) > new Date(lastActivity)) {
        lastActivity = progress.lastActivityAt;
      }
    }
  }
  
  const totalSections = sections.length;
  const completionPercentage = totalSections > 0 ? 
    Math.round((completedSections / totalSections) * 100) : 0;
  
  return {
    completedSections,
    totalSections,
    completionPercentage,
    timeSpent: totalTimeSpent,
    durationWatched: totalDurationWatched,
    lastActivity: lastActivity || course.createdAt
  };
}

// Placeholder methods for additional functionality
async function getStudentCourses(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Get student courses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function createCourse(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function updateCourse(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function deleteCourse(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getCourseSections(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Get course sections error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function createSection(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function updateSection(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function deleteSection(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getEnrollments(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function updateEnrollment(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Update enrollment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function approveEnrollment(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Approve enrollment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function rejectEnrollment(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Reject enrollment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getStudentProgress(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function markCourseComplete(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Mark course complete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function markSectionComplete(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Mark section complete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getAssignments(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getAssignmentSubmissions(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Get assignment submissions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function gradeAssignment(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getQuizzes(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getQuizResponses(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Get quiz responses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getEnrollmentAnalytics(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Get enrollment analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getCompletionAnalytics(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Get completion analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getProgressAnalytics(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Get progress analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getPerformanceAnalytics(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Get performance analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getCourseCertificates(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Get course certificates error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function generateCertificate(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function downloadCertificate(req, res) {
  try {
    res.json({ success: true, message: 'This feature is under development' });
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getDashboardData,
  getMyCourses,
  getCourseAnalytics,
  getMyStudents,
  getCourseProgress,
  getStudentCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseSections,
  createSection,
  updateSection,
  deleteSection,
  getEnrollments,
  updateEnrollment,
  approveEnrollment,
  rejectEnrollment,
  getStudentProgress,
  markCourseComplete,
  markSectionComplete,
  getAssignments,
  getAssignmentSubmissions,
  gradeAssignment,
  getQuizzes,
  getQuizResponses,
  getEnrollmentAnalytics,
  getCompletionAnalytics,
  getProgressAnalytics,
  getPerformanceAnalytics,
  getCourseCertificates,
  generateCertificate,
  downloadCertificate
};