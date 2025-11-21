const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {authorize} = require('../middleware/roleMiddleware');
const adminController = require('../controllers/admin.controller');
const courseController = require('../controllers/course.controller');
const userController = require('../controllers/user.controller');
const enrollmentController = require('../controllers/enrollment.controller');
const paymentController = require('../controllers/payment.controller');
const categoryController = require('../controllers/category.controller');

// Require admin role for all routes
router.use(authorize(['admin']));

// Dashboard Routes
router.get('/dashboard', adminController.getDashboardData);
router.get('/analytics/system', adminController.getSystemAnalytics);

// User Management Routes
router.get('/users', adminController.getUsers);

// Course Management Routes
router.get('/courses', adminController.getAllCourses);
router.post('/courses/:courseId/approve', adminController.approveCourse);
router.post('/courses/:courseId/reject', adminController.rejectCourse);
router.get('/courses/pending-approval', adminController.getCoursesPendingApproval);

// Enrollment Management Routes
router.get('/enrollments', adminController.getEnrollments);
router.get('/system/stats', adminController.getSystemStats);

module.exports = router;