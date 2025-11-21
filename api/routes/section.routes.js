const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/section.controller');
const authMiddleware = require('../middleware/auth.middleware');
//const { requirePermission } = require('../middleware/permissionMiddleware');
//const { PERMISSIONS } = require('../config/permission');
const { authorize } = require('../middleware/roleMiddleware');
// Create a section and optionally attach to a course
router.post('/', authMiddleware,  authorize(['admin']),  sectionController.createSection);

// Get a section by id
router.get('/:id',  authMiddleware, authorize(['admin']),  sectionController.getSection);

// Update section
router.put('/:id', authMiddleware, authorize(['admin']),  sectionController.updateSection);

// Delete section (optionally pass ?courseId= to remove association)
router.delete('/:id',  authMiddleware, authorize(['admin']),  sectionController.deleteSection);

// Duplicate section
router.post('/:id/duplicate',  authMiddleware, authorize(['admin']),  sectionController.duplicateSection);

// Reorder sections within a course
router.post('/course/:courseId/reorder',  authMiddleware, authorize(['admin']),  sectionController.reorderSections);

// Section Progress Tracking Routes
// Get section progress for current user
router.get('/:id/progress', authMiddleware, sectionController.getSectionProgress);

// Update section progress (single update)
router.post('/:id/progress', authMiddleware, sectionController.updateSectionProgress);

// Update section progress (batch updates)
router.post('/:id/progress/batch', authMiddleware, sectionController.updateSectionProgressBatch);

// Get section progress logs
router.get('/:id/progress/logs', authMiddleware, sectionController.getSectionProgressLogs);

// Get section analytics (for admin/instructor)
router.get('/:id/analytics', authMiddleware, authorize(['admin', 'instructor']), sectionController.getSectionAnalytics);

module.exports = router;
