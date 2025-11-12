const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/roleMiddleware');
const permissionController = require('../controllers/permission.controller');
const roleController = require('../controllers/role.controller');

// Permission routes - Admin only
router.post('/permissions', authMiddleware, authorize(['admin']), permissionController.createPermission);
router.get('/permissions', authMiddleware, authorize(['admin']), permissionController.getPermissions);
router.get('/permissions/:id', authMiddleware, authorize(['admin']), permissionController.getPermissionById);
router.put('/permissions/:id', authMiddleware, authorize(['admin']), permissionController.updatePermission);
router.delete('/permissions/:id', authMiddleware, authorize(['admin']), permissionController.deletePermission);

// Role routes - Admin only
router.post('/roles', authMiddleware, authorize(['admin']), roleController.createRole);
router.get('/roles', authMiddleware, authorize(['admin']), roleController.getRoles);
router.get('/roles/:id', authMiddleware, authorize(['admin']), roleController.getRoleById);
router.put('/roles/:id', authMiddleware, authorize(['admin']), roleController.updateRole);
router.delete('/roles/:id', authMiddleware, authorize(['admin']), roleController.deleteRole);

// Role-Permission association routes
router.post('/roles/permissions/add', authMiddleware, authorize(['admin']), roleController.addPermissionToRole);
router.post('/roles/permissions/remove', authMiddleware, authorize(['admin']), roleController.removePermissionFromRole);

module.exports = router;
