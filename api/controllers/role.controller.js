const roleService = require('../services/role.service');

async function createRole(req, res) {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).json({ data: role, message: 'Role created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getRoles(req, res) {
  try {
    const roles = await roleService.getRoles();
    res.json({ data: roles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getRoleById(req, res) {
  try {
    const role = await roleService.getRoleById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json({ data: role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateRole(req, res) {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json({ data: role, message: 'Role updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteRole(req, res) {
  try {
    const role = await roleService.deleteRole(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function addPermissionToRole(req, res) {
  try {
    const { roleId, permissionId } = req.body;
    const role = await roleService.addPermissionToRole(roleId, permissionId);
    res.json({ data: role, message: 'Permission added to role successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function removePermissionFromRole(req, res) {
  try {
    const { roleId, permissionId } = req.body;
    const role = await roleService.removePermissionFromRole(roleId, permissionId);
    res.json({ data: role, message: 'Permission removed from role successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  addPermissionToRole,
  removePermissionFromRole,
};
