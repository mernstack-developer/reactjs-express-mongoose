const express = require('express');
const router = express.Router();
//const authMiddleware = require('../middleware/auth.middleware');
const {authorize} = require('../middleware/roleMiddleware');
const instructorController = require('../controllers/instructor.controller');
const courseController = require('../controllers/course.controller');
const sectionController = require('../controllers/section.controller');
//const enrollmentController = require('../controllers/enrollment.controller');
//const assignmentController = require('../controllers/assignment.controller');
//const userController = require('../controllers/user.controller');

// Require instructor role for all routes
router.use(authorize(['instructor', 'admin']));

// Dashboard Routes
router.get('/dashboard', instructorController.getDashboardData);
router.get('/courses', instructorController.getMyCourses);
router.get('/courses/:courseId/analytics', instructorController.getCourseAnalytics);
router.get('/students', instructorController.getMyStudents);
router.get('/progress/:courseId', instructorController.getCourseProgress);

// Course Management Routes (using existing course controller)
router.post('/courses', courseController.createCourse);
router.put('/courses/:courseId', courseController.updateCourse);
router.delete('/courses/:courseId', courseController.deleteCourse);
//router.get('/courses/:courseId/sections', sectionController.getCourseSections);
router.post('/courses/:courseId/sections', sectionController.createSection);
router.put('/sections/:sectionId', sectionController.updateSection);
router.delete('/sections/:sectionId', sectionController.deleteSection);

// Enrollment Management Routes (using existing enrollment controller)
// router.get('/enrollments', enrollmentController.getEnrollments);
// router.put('/enrollments/:enrollmentId', enrollmentController.updateEnrollment);
// router.post('/enrollments/approve/:enrollmentId', enrollmentController.approveEnrollment);
// router.post('/enrollments/reject/:enrollmentId', enrollmentController.rejectEnrollment);

// Progress and Assessment Routes
router.get('/progress/:courseId/students/:studentId', instructorController.getStudentProgress);
router.post('/progress/:courseId/students/:studentId/complete', instructorController.markCourseComplete);
router.post('/progress/:courseId/sections/:sectionId/complete', instructorController.markSectionComplete);

// Assignment and Quiz Routes (using existing assignment controller)
// router.get('/assignments/:courseId', assignmentController.getCourseAssignments);
// router.get('/assignments/:assignmentId/submissions', assignmentController.getAssignmentSubmissions);
// router.post('/assignments/:assignmentId/submissions/:submissionId/grade', assignmentController.gradeAssignment);
// router.get('/quizzes/:courseId', assignmentController.getCourseQuizzes);
// router.get('/quizzes/:quizId/responses', assignmentController.getQuizResponses);

// Analytics Routes
router.get('/analytics/courses/:courseId/enrollment', instructorController.getEnrollmentAnalytics);
router.get('/analytics/courses/:courseId/completion', instructorController.getCompletionAnalytics);
router.get('/analytics/courses/:courseId/progress', instructorController.getProgressAnalytics);
router.get('/analytics/courses/:courseId/performance', instructorController.getPerformanceAnalytics);

// Certificate Management Routes
router.get('/certificates/:courseId', instructorController.getCourseCertificates);
router.post('/certificates/:courseId/generate/:studentId', instructorController.generateCertificate);
router.get('/certificates/:certificateId/download', instructorController.downloadCertificate);

module.exports = router;