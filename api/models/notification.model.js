
const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  recipient_id: { type: String, required: true },
}, {
  timestamps: true, // This option automatically manages createdAt and updatedAt fields.
});

module.exports = mongoose.model('Notification', notificationSchema);
