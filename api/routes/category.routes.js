const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { PERMISSIONS } = require('../config/permission');

// Public: list categories
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);

// Admin CRUD
router.post('/', authMiddleware, requirePermission(PERMISSIONS.EDIT_COURSE), categoryController.createCategory);
router.put('/:id', authMiddleware, requirePermission(PERMISSIONS.EDIT_COURSE), categoryController.updateCategory);
router.delete('/:id', authMiddleware, requirePermission(PERMISSIONS.EDIT_COURSE), categoryController.removeCategory);

module.exports = router;
