const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { PERMISSIONS } = require('../config/permission');

// Public routes (no authentication required)
// GET /api/menu - Get all menu items with hierarchy
router.get('/', menuController.getAllMenuItems);

// Protected routes (authentication required)
// POST /api/menu - Create new menu item
router.post('/', authMiddleware, requirePermission(PERMISSIONS.EDIT_MENU), menuController.createMenuItem);

// PUT /api/menu/:id - Update menu item
router.put('/:id', authMiddleware, requirePermission(PERMISSIONS.EDIT_MENU), menuController.updateMenuItem);

// DELETE /api/menu/:id - Delete menu item
router.delete('/:id', authMiddleware, requirePermission(PERMISSIONS.EDIT_MENU), menuController.deleteMenuItem);

// POST /api/menu/reorder - Reorder menu items
router.post('/reorder', authMiddleware, requirePermission(PERMISSIONS.EDIT_MENU), menuController.reorderMenuItems);

module.exports = router;