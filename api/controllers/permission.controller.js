const permissionService = require('../services/permission.service');

async function createPermission(req, res) {
  try {
    const permission = await permissionService.createPermission(req.body);
    res.status(201).json({ data: permission, message: 'Permission created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getPermissions(req, res) {
  try {
    const permissions = await permissionService.getPermissions();
    res.json({ data: permissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPermissionById(req, res) {
  try {
    const permission = await permissionService.getPermissionById(req.params.id);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    res.json({ data: permission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updatePermission(req, res) {
  try {
    const permission = await permissionService.updatePermission(req.params.id, req.body);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    res.json({ data: permission, message: 'Permission updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deletePermission(req, res) {
  try {
    const permission = await permissionService.deletePermission(req.params.id);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    res.json({ message: 'Permission deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createPermission,
  getPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
};
