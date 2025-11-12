const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Create assignment standalone
router.post('/', authMiddleware, assignmentController.createAssignment);
// Create assignment and attach as an activity to a section
router.post('/create-activity', authMiddleware, assignmentController.createAssignmentActivity);
// Get assignment details
router.get('/:id', authMiddleware, assignmentController.getAssignment);
// Submit assignment
router.post('/:id/submit', authMiddleware, assignmentController.submitAssignment);
// List submissions
router.get('/:id/submissions', authMiddleware, assignmentController.listSubmissions);
// Grade a submission
router.post('/submission/:submissionId/grade', authMiddleware, assignmentController.gradeSubmission);

module.exports = router;
