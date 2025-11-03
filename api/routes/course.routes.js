const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');

// GET /api/courses: List all coursesg
router.get('/', courseController.getCourses);

// POST /api/courses/register: Register a user for a course
router.post('/register', courseController.registerUserForCourse);
// POST /api/courses: Create a new course
router.post('/', courseController.createCourse);

// GET /api/courses/:id: Get course by ID
router.get('/:id', courseController.getCourseById);

// PUT /api/courses/:id: Update course by ID
router.put('/:id', courseController.updateCourse);

// DELETE /api/courses/:id: Delete course by ID
router.delete('/:id', courseController.deleteCourse);   
module.exports = router;
