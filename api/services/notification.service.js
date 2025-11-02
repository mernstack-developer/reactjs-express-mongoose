const Notification = require('../models/notification.model');

async function createNotification(data) {
    const notification = new Notification(data);
    return await notification.save();
}

async function getNotifications(since) {
   // try {
   let query = {};
// If a 'since' date is available, add a condition to the query object
if (since instanceof Date && !isNaN(since)) {
  query.createdAt = { $gt: since }; // Filter for createdAt greater than 'since'
}
    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    //res.status(200).json(notifications);
 // } catch (error) {
   // res.status(500).json({ message: 'Error fetching notifications' });
 // }
    return notifications;
}

async function getNotificationById(id) {
    return await Notification.findById(id).lean();
}

async function updateNotification(id, data) {
    // try {
    const notification = await Notification.findByIdAndUpdate(id, data, { new: true });

   // if (!notification) {
   //   return res.status(404).json({ message: 'Notification not found' });
   // }

  //  res.status(200).json({ message: `Notification ${id} marked as read.`, notification });
  //} catch (error) {
  //  res.status(500).json({ message: 'Error marking notification as read' });
  //}
  return notification;
}

async function deleteNotification(id) {
    return await Notification.findByIdAndDelete(id).lean();
}

module.exports = {
    createNotification,
    getNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
};
