const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { PERMISSIONS } = require('../config/permission');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/roleMiddleware');
//const { checkEnrollment } = require('../middleware/checkenrollmentMiddleware');
// GET /api/courses: List all courses
router.get('/',authMiddleware,requirePermission(PERMISSIONS.VIEW_COURSE), courseController.getCourses);

// POST /api/courses/register: Register a user for a course
router.post('/register',authMiddleware, requirePermission(PERMISSIONS.ENROLL_STUDENTS), courseController.registerUserForCourse);

router.get('/registered/:userId', authMiddleware, courseController.getCoursesByUser);

// POST /api/courses: Create a new course
router.post('/',authMiddleware,requirePermission(PERMISSIONS.EDIT_COURSE), courseController.createCourse);

// GET /api/courses/:id: Get course by ID
router.get('/view/:id', authMiddleware, authorize(['admin']) ,courseController.getCourseById);

// PUT /api/courses/:id: Update course by ID
router.put('/edit/:id', authMiddleware, requirePermission(PERMISSIONS.EDIT_COURSE), courseController.updateCourse);

// DELETE /api/courses/:id: Delete course by ID
router.delete('/delete/:id', authMiddleware, requirePermission(PERMISSIONS.EDIT_COURSE), courseController.deleteCourse);
module.exports = router;
