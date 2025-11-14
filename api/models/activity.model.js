const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  isHidden: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', ActivitySchema);
