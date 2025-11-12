const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, activityController.createActivity);
router.get('/:id', authMiddleware, activityController.getActivity);
router.put('/:id', authMiddleware, activityController.updateActivity);
router.delete('/:id', authMiddleware, activityController.deleteActivity);

module.exports = router;
