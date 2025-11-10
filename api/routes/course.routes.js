const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { PERMISSIONS } = require('../config/permission');
//const { checkEnrollment } = require('../middleware/checkenrollmentMiddleware');
// GET /api/courses: List all courses
router.get('/', courseController.getCourses);

// POST /api/courses/register: Register a user for a course
router.post('/register', requirePermission(PERMISSIONS.ENROLL_STUDENTS), courseController.registerUserForCourse);

// POST /api/courses: Create a new course
router.post('/', requirePermission(PERMISSIONS.EDIT_COURSE), courseController.createCourse);

// GET /api/courses/:id: Get course by ID
router.get('/:id', requirePermission(PERMISSIONS.VIEW_COURSE), courseController.getCourseById);

// PUT /api/courses/:id: Update course by ID
router.put('/:id', requirePermission(PERMISSIONS.EDIT_COURSE), courseController.updateCourse);

// DELETE /api/courses/:id: Delete course by ID
router.delete('/:id', requirePermission(PERMISSIONS.DELETE_COURSE), courseController.deleteCourse);
module.exports = router;
