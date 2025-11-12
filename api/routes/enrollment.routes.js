const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { PERMISSIONS } = require('../config/permission');

// Public routes (no authentication required)
// GET /api/enrollment/public-courses - Get all publicly available courses
router.get('/public-courses', enrollmentController.getPublicCourses);

// Protected routes (authentication required)
// POST /api/enrollment/enroll/:courseId - Self-enroll in a free public course
router.post('/enroll/:courseId', authMiddleware, enrollmentController.selfEnroll);

// POST /api/enrollment/unenroll/:courseId - Unenroll from a course
router.post('/unenroll/:courseId', authMiddleware, enrollmentController.unenroll);

// GET /api/enrollment/status/:courseId - Get enrollment status for current user
router.get('/status/:courseId', authMiddleware, enrollmentController.getEnrollmentStatus);

// Admin routes (admin only)
// PUT /api/enrollment/settings/:courseId - Update course enrollment settings
router.put('/settings/:courseId', 
    authMiddleware, 
    requirePermission(PERMISSIONS.EDIT_COURSE), 
    enrollmentController.updateEnrollmentSettings
);

module.exports = router;
