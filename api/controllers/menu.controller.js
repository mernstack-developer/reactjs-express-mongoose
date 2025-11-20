const menuService = require('../services/menu.service');

/**
 * Get all menu items with hierarchical structure
 */
async function getAllMenuItems(req, res) {
  try {
    const menuItems = await menuService.getAllMenuItems();
    console.log('Fetched menu items:', menuItems.data);
    res.json({
      success: true,
      data: menuItems,
      message: 'Menu items retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch menu items'
    });
  }
}

/**
 * Create a new menu item
 */
async function createMenuItem(req, res) {
  try {
    const { name, url, icon, parent, order } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Menu item name is required'
      });
    }

    const menuItemData = {
      name: name.trim(),
      url: url || '',
      icon: icon || '',
      parent: parent || null,
      order: order || 0
    };

    const newMenuItem = await menuService.createMenuItem(menuItemData);
    
    res.status(201).json({
      success: true,
      data: newMenuItem,
      message: 'Menu item created successfully'
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Menu item with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create menu item'
    });
  }
}

/**
 * Update an existing menu item
 */
async function updateMenuItem(req, res) {
  try {
    const { id } = req.params;
    const { name, url, icon, parent, order } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Menu item name is required'
      });
    }

    // Prevent circular dependency
    if (parent) {
      const isCircular = await menuService.checkCircularDependency(id, parent);
      if (isCircular) {
        return res.status(400).json({
          success: false,
          error: 'Cannot create circular dependency. An item cannot be its own ancestor.'
        });
      }
    }

    const updateData = {
      name: name.trim(),
      url: url || '',
      icon: icon || '',
      parent: parent || null,
      order: order || 0,
      updatedAt: new Date()
    };

    const updatedMenuItem = await menuService.updateMenuItem(id, updateData);
    
    if (!updatedMenuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: updatedMenuItem,
      message: 'Menu item updated successfully'
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Menu item with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update menu item'
    });
  }
}

/**
 * Delete a menu item
 */
async function deleteMenuItem(req, res) {
  try {
    const { id } = req.params;

    // Check if item has children
    const hasChildren = await menuService.hasChildren(id);
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete menu item with children. Please remove child items first.'
      });
    }

    const deletedMenuItem = await menuService.deleteMenuItem(id);
    
    if (!deletedMenuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: deletedMenuItem,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete menu item'
    });
  }
}

/**
 * Reorder menu items (bulk update)
 */
async function reorderMenuItems(req, res) {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required'
      });
    }

    // Validate items structure
    for (const item of items) {
      if (!item._id || typeof item.order !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Each item must have _id and order properties'
        });
      }
    }

    const updatedItems = await menuService.reorderMenuItems(items);
    
    res.json({
      success: true,
      data: updatedItems,
      message: 'Menu items reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering menu items:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reorder menu items'
    });
  }
}

module.exports = {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems
};