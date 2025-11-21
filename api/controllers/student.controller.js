const mongoose = require('mongoose');
const Course = require('../models/course.model');
const Section = require('../models/section.model');
const Certificate = require('../models/certificate.model');
const { SectionProgress } = require('../models/section.model');
const User = require('../models/user.model');
const userService = require('../services/user.service');
// Get student dashboard data
async function getDashboardData(req, res) {
  try {
    const userId = req.user.id;
    
    // Get active courses
    const activeCourses = await getActiveCoursesForUser(userId);
    
    // Get completed courses
    const completedCourses = await getCompletedCoursesForUser(userId);
    
    // Get recent activity
    const recentActivity = await getRecentActivityForUser(userId);
    
    // Get certificates
    const certificates = await getCertificatesForUser(userId);
    
    res.json({
      success: true,
      data: {
        activeCourses,
        completedCourses,
        recentActivity,
        certificates,
        summary: {
          totalActiveCourses: activeCourses.length,
          totalCompletedCourses: completedCourses.length,
          totalCertificates: certificates.length,
          totalTimeSpent: activeCourses.reduce((total, course) => total + course.progress.timeSpent, 0) +
                          completedCourses.reduce((total, course) => total + course.progress.timeSpent, 0)
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get active courses for user
async function getActiveCoursesForUser(userId) {
  const user = await User.findById(userId).populate({
    path: 'registeredCourses',
    populate: {
      path: 'category'
    }
  });
  
  const courses = [];
  for (const course of user.registeredCourses) {
    const progress = await getCourseProgress(userId, course._id);
    
    // Check if course is completed by checking if all sections are completed
    const sections = await Section.find({ courseId: course._id });
    let isCompleted = false;
    
    if (sections.length > 0) {
      const completedSections = await SectionProgress.countDocuments({
        userId: userId,
        sectionId: { $in: sections.map(s => s._id) },
        isCompleted: true
      });
      isCompleted = completedSections === sections.length;
    }
    // If no sections, consider the course as active (not completed)
    
    // Only add to active courses if not completed
    if (!isCompleted) {
      courses.push({
        _id: course._id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        category: course.category,
        totalDuration: course.totalDuration || 0,
        progress,
        enrolledAt: new Date(), // Since we don't have enrollment date, use current date
        isCompleted: false
      });
    }
  }
  
  return courses;
}

// Get completed courses for user
async function getCompletedCoursesForUser(userId) {
  const user = await User.findById(userId).populate({
    path: 'registeredCourses',
    populate: {
      path: 'category'
    }
  });
  
  const courses = [];
  for (const course of user.registeredCourses) {
    const sections = await Section.find({ courseId: course._id });
    
    if (sections.length > 0) { // Only consider courses with sections as completable
      const completedSections = await SectionProgress.countDocuments({
        userId: userId,
        sectionId: { $in: sections.map(s => s._id) },
        isCompleted: true
      });
      const isCompleted = completedSections === sections.length;
      
      if (isCompleted) {
        const progress = await getCourseProgress(userId, course._id);
        
        courses.push({
          _id: course._id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          instructor: course.instructor,
          category: course.category,
          totalDuration: course.totalDuration || 0,
          progress,
          enrolledAt: new Date(), // Since we don't have enrollment date, use current date
          completedAt: new Date(), // Use current date as completion date
          isCompleted: true
        });
      }
    }
  }
  
  return courses;
}

// Get recent activity for user
async function getRecentActivityForUser(userId) {
  const activities = await SectionProgress.find({ userId })
    .sort({ lastActivityAt: -1 })
    .limit(10)
    .populate('sectionId');
  
  return activities.map(progress => ({
    action: `Studied ${progress.sectionId?.title || 'Unknown Section'}`,
    timestamp: progress.lastActivityAt,
    sectionId: progress.sectionId?._id,
    timeSpent: progress.timeSpent,
    completionPercentage: progress.completionPercentage
  }));
}

// Get certificates for user
async function getCertificatesForUser(userId) {
  const certificates = await Certificate.find({ studentId: userId })
    .populate('courseId')
    .sort({ createdAt: -1 });
  
  return certificates.map(cert => ({
    _id: cert._id,
    courseId: cert.courseId._id,
    courseTitle: cert.courseId.title,
    studentName: cert.studentName,
    completionDate: cert.completionDate,
    score: cert.score,
    qrCode: cert.qrCode
  }));
}

// Get course progress
async function getCourseProgress(userId, courseId) {
  const course = await Course.findById(courseId).populate('sections');
  if (!course) {
    throw new Error('Course not found');
  }
  
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

// Get course progress
async function getCourseProgress(req, res) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    const progress = await getCourseProgress(userId, courseId);
    
    res.json({ success: true, data: progress });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get section progress
async function getSectionProgress(req, res) {
  try {
    const { sectionId } = req.params;
    const userId = req.user.id;
    
    const progress = await SectionProgress.findOne({ 
      sectionId, 
      userId 
    }).sort({ lastActivityAt: -1 });
    
    res.json({ 
      success: true, 
      data: progress || {
        sectionId,
        userId,
        timeSpent: 0,
        durationWatched: 0,
        completionPercentage: 0,
        isCompleted: false
      }
    });
  } catch (error) {
    console.error('Get section progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Update section progress
async function updateSectionProgress(req, res) {
  try {
    const { sectionId } = req.params;
    const userId = req.user.id;
    const { timeSpent = 0, durationWatched = 0 } = req.body;
    
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }
    
    // Use the existing updateProgress method from Section model
    const progress = await Section.updateProgress(sectionId, userId, timeSpent, durationWatched);
    
    // Check if course completion should be updated
    const courseProgress = await getCourseProgress(userId, section.courseId);
    if (courseProgress.completionPercentage >= 100) {
      await checkCourseCompletion(userId, section.courseId);
    }
    
    res.json({ success: true, data: progress });
  } catch (error) {
    console.error('Update section progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Check course completion
async function checkCourseCompletion(userId, courseId) {
  try {
    const progress = await getCourseProgress(userId, courseId);
    
    if (progress.completionPercentage >= 90) { // 90% completion threshold
      console.log(`Course ${courseId} completed for user ${userId} with ${progress.completionPercentage}% completion`);
      // In a real implementation, you might want to generate a certificate here
    }
  } catch (error) {
    console.error('Check course completion error:', error);
  }
}

// Download certificate
async function downloadCertificate(req, res) {
  try {
    const { id: certificateId } = req.params;
    const userId = req.user.id;
    
    const certificate = await Certificate.findOne({ 
      _id: certificateId, 
      studentId: userId 
    }).populate('courseId');
    
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    
    // Generate PDF certificate
    const pdfBuffer = await generateCertificatePDF(certificate);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${certificate.courseId.title.replace(/\s+/g, '_')}_Certificate.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Generate certificate PDF
async function generateCertificatePDF(certificate) {
  // This would use a PDF generation library like puppeteer or jsPDF
  // For now, return a placeholder
  const pdfContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .certificate { border: 10px solid #gold; padding: 30px; margin: 20px; }
          h1 { color: #333; font-size: 36px; margin-bottom: 20px; }
          h2 { color: #666; font-size: 24px; margin-bottom: 20px; }
          .date { color: #888; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>Certificate of Completion</h1>
          <h2>${certificate.courseTitle}</h2>
          <p>Presented to</p>
          <h2>${certificate.studentName}</h2>
          <p class="date">Completed on ${new Date(certificate.completionDate).toLocaleDateString()}</p>
        </div>
      </body>
    </html>
  `;
  
  // In a real implementation, you would use a library to convert HTML to PDF
  // For now, return a simple text representation
  return Buffer.from(`Certificate for ${certificate.courseTitle} - ${certificate.studentName}`);
}

// Get analytics data
async function getProgressAnalytics(req, res) {
  try {
    const userId = req.user.id;
    
    // Get progress over time
    const progressData = await SectionProgress.aggregate([
      { $match: { userId } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastActivityAt' } }, totalProgress: { $sum: '$durationWatched' } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({ success: true, data: progressData });
  } catch (error) {
    console.error('Get progress analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getTimeSpentAnalytics(req, res) {
  try {
    const userId = req.user.id;
    
    const timeData = await SectionProgress.aggregate([
      { $match: { userId } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastActivityAt' } }, totalTime: { $sum: '$timeSpent' } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({ success: true, data: timeData });
  } catch (error) {
    console.error('Get time spent analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getCompletionRateAnalytics(req, res) {
  try {
    const userId = req.user.id;
    
    const completionData = await SectionProgress.aggregate([
      { $match: { userId } },
      { $group: { _id: null, completedSections: { $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] } }, totalSections: { $sum: 1 } } }
    ]);
    
    const completionRate = completionData[0] ? 
      (completionData[0].completedSections / completionData[0].totalSections) * 100 : 0;
    
    res.json({ success: true, data: { completionRate } });
  } catch (error) {
    console.error('Get completion rate analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getDashboardData,
  getActiveCourses: async (req, res) => {
    const courses = await getActiveCoursesForUser(req.user.id);
    res.json({ success: true, data: courses });
  },
  getCompletedCourses: async (req, res) => {
    const courses = await getCompletedCoursesForUser(req.user.id);
    res.json({ success: true, data: courses });
  },
  getRecentActivity: async (req, res) => {
    const activity = await getRecentActivityForUser(req.user.id);
    res.json({ success: true, data: activity });
  },
  getCertificates: async (req, res) => {
    const certificates = await getCertificatesForUser(req.user.id);
    res.json({ success: true, data: certificates });
  },
  getAssignments: async (req, res) => {
    try {
      const userId = req.user.id;
      const assignments = await userService.getAssignmentsForUser(userId);
      
      res.json({ success: true, data: assignments });
    } catch (error) {
      console.error('Get assignments error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getCourseProgress,
  getSectionProgress,
  updateSectionProgress,
  downloadCertificate,
  getProgressAnalytics,
  getTimeSpentAnalytics,
  getCompletionRateAnalytics
};