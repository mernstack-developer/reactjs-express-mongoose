const Role = require('../models/role.model');

async function createRole(data) {
  const role = new Role(data);
  return await role.save();
}

async function getRoles() {
  return await Role.find().populate('permissions').lean();
}

async function getRoleById(id) {
  return await Role.findById(id).populate('permissions').lean();
}

async function updateRole(id, data) {
  return await Role.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('permissions').lean();
}

async function deleteRole(id) {
  return await Role.findByIdAndDelete(id).lean();
}

async function getRoleByName(name) {
  return await Role.findOne({ name }).populate('permissions').lean();
}

async function addPermissionToRole(roleId, permissionId) {
  const role = await Role.findById(roleId);
  if (!role) throw new Error('Role not found');
  
  if (!role.permissions.includes(permissionId)) {
    role.permissions.push(permissionId);
    await role.save();
  }
  
  return await Role.findById(roleId).populate('permissions').lean();
}

async function removePermissionFromRole(roleId, permissionId) {
  const role = await Role.findById(roleId);
  if (!role) throw new Error('Role not found');
  
  role.permissions = role.permissions.filter(id => id.toString() !== permissionId);
  await role.save();
  
  return await Role.findById(roleId).populate('permissions').lean();
}

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getRoleByName,
  addPermissionToRole,
  removePermissionFromRole,
};
