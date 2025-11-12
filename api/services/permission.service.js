const Permission = require('../models/permission.model');

async function createPermission(data) {
  const permission = new Permission(data);
  return await permission.save();
}

async function getPermissions() {
  return await Permission.find().lean();
}

async function getPermissionById(id) {
  return await Permission.findById(id).lean();
}

async function updatePermission(id, data) {
  return await Permission.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

async function deletePermission(id) {
  return await Permission.findByIdAndDelete(id).lean();
}

async function getPermissionByName(name) {
  return await Permission.findOne({ name }).lean();
}

module.exports = {
  createPermission,
  getPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
  getPermissionByName,
};
