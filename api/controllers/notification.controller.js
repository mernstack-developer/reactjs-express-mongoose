const notificationService = require('../services/notification.service');

async function createNotification(req, res) {
    try {
        const notification = await notificationService.createNotification(req.body);
        res.status(201).json({data:notification});
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
}

async function getNotifications( req, res) {
    try {
        const notifications = await notificationService.getNotifications(req.query.since );
        res.status(200).json({ data: notifications });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

async function getNotificationById(req, res) {
    try {
        const notification = await notificationService.getUserById(req.params.id);
        if (!notification) return res.status(404).json({ error: 'notification not found' });
        res.json({ data: notification });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

async function updateNotification(req, res) {
    try {
        const notification = await notificationService.updateUser(req.params.id, req.body);
        if (!notification) return res.status(404).json({ error: 'notification not found' });
        res.json(notification);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
}

async function deleteNotification(req, res) {
    try {
        const notification = await notificationService.deleteNotification(req.params.id);
        if (!notification) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'notification deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    createNotification,
    getNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
};
