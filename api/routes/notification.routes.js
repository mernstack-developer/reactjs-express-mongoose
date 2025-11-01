const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// GET all notifications
router.get('/', notificationController.getNotifications);

// POST to mark a notification as read
router.post('/:id/read', notificationController.updateNotification);

module.exports = router;
