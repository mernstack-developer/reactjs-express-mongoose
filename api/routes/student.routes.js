const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const studentController = require('../controllers/student.controller');

// Student Dashboard Routes
router.get('/dashboard', authMiddleware, studentController.getDashboardData);
router.get('/courses/active', authMiddleware, studentController.getActiveCourses);
router.get('/courses/completed', authMiddleware, studentController.getCompletedCourses);
router.get('/activity/recent', authMiddleware, studentController.getRecentActivity);
router.get('/certificates', authMiddleware, studentController.getCertificates);
router.get('/certificates/:id/download', authMiddleware, studentController.downloadCertificate);

// Course Progress Routes
router.get('/progress/course/:courseId', authMiddleware, studentController.getCourseProgress);
router.get('/progress/section/:sectionId', authMiddleware, studentController.getSectionProgress);
router.post('/progress/section/:sectionId', authMiddleware, studentController.updateSectionProgress);

// Analytics Routes
router.get('/analytics/progress', authMiddleware, studentController.getProgressAnalytics);
router.get('/analytics/time-spent', authMiddleware, studentController.getTimeSpentAnalytics);
router.get('/analytics/completion-rate', authMiddleware, studentController.getCompletionRateAnalytics);

module.exports = router;