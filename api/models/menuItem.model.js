const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String },
  icon: { type: String },
  parent: { type: ObjectId, ref: 'MenuItem', default: null }, // Reference to parent
  order: { type: Number, default: 0 }, // For sorting at the same level
});

module.exports = mongoose.model('MenuItem', menuItemSchema);