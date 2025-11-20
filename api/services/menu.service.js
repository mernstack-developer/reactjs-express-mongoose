const MenuItem = require('../models/menuItem.model');

/**
 * Get all menu items and build hierarchical structure
 */
async function getAllMenuItems() {
  try {
    const items = await MenuItem.find().sort({ order: 1 }).lean();
    return buildHierarchicalStructure(items);
  } catch (error) {
    throw new Error('Failed to fetch menu items: ' + error.message);
  }
}

/**
 * Create hierarchical structure from flat array
 */
function buildHierarchicalStructure(flatItems) {
  const itemMap = new Map();
  const rootItems = [];

  // Create map of all items
  flatItems.forEach(item => {
    itemMap.set(item._id.toString(), { ...item, children: [] });
  });

  // Build hierarchy
  flatItems.forEach(item => {
    const currentItem = itemMap.get(item._id.toString());
    if (!currentItem) return;

    if (item.parent) {
      const parentItem = itemMap.get(item.parent.toString());
      if (parentItem) {
        parentItem.children = parentItem.children || [];
        parentItem.children.push(currentItem);
      }
    } else {
      rootItems.push(currentItem);
    }
    
  });

  // Sort by order
  rootItems.sort((a, b) => (a.order || 0) - (b.order || 0));
  return rootItems;
//   const buildMenuTree = (items, parentId = null) => {
//   return items
//     .filter(item => (item.parent ? item.parent.toString() : null) === parentId)
//     .sort((a, b) => a.order - b.order)
//     .map(item => ({
//       ...item._doc,
//       children: buildMenuTree(items, item._id.toString()),
//     }));
// };
}

/**
 * Create a new menu item
 */
async function createMenuItem(data) {
  try {
    const menuItem = new MenuItem(data);
    return await menuItem.save();
  } catch (error) {
    throw new Error('Failed to create menu item: ' + error.message);
  }
}

/**
 * Update a menu item
 */
async function updateMenuItem(id, data) {
  try {
    return await MenuItem.findByIdAndUpdate(id, data, { new: true });
  } catch (error) {
    throw new Error('Failed to update menu item: ' + error.message);
  }
}

/**
 * Delete a menu item
 */
async function deleteMenuItem(id) {
  try {
    return await MenuItem.findByIdAndDelete(id);
  } catch (error) {
    throw new Error('Failed to delete menu item: ' + error.message);
  }
}

/**
 * Check if moving an item would create a circular dependency
 */
async function checkCircularDependency(itemId, newParentId) {
  try {
    if (!newParentId || itemId === newParentId) {
      return false;
    }

    // Get the item to be moved
    const itemToMove = await MenuItem.findById(itemId);
    if (!itemToMove) {
      throw new Error('Item not found');
    }

    // Check if new parent is a descendant of the item to be moved
    return await isDescendant(newParentId, itemId);
  } catch (error) {
    throw new Error('Failed to check circular dependency: ' + error.message);
  }
}

/**
 * Check if a potential parent is a descendant of the item
 */
async function isDescendant(ancestorId, descendantId) {
  try {
    const queue = [ancestorId];
    
    while (queue.length > 0) {
      const currentId = queue.shift();
      const children = await MenuItem.find({ parent: currentId }).lean();
      
      for (const child of children) {
        if (child._id.toString() === descendantId.toString()) {
          return true;
        }
        queue.push(child._id);
      }
    }
    
    return false;
  } catch (error) {
    throw new Error('Failed to check descendant relationship: ' + error.message);
  }
}

/**
 * Check if a menu item has children
 */
async function hasChildren(itemId) {
  try {
    const count = await MenuItem.countDocuments({ parent: itemId });
    return count > 0;
  } catch (error) {
    throw new Error('Failed to check children: ' + error.message);
  }
}

/**
 * Bulk update menu item order
 */
async function reorderMenuItems(items) {
  try {
    const updates = items.map(item => ({
      updateOne: {
        filter: { _id: item._id },
        update: { order: item.order }
      }
    }));

    await MenuItem.bulkWrite(updates);
    
    // Return updated items
    const updatedItems = await MenuItem.find({
      _id: { $in: items.map(item => item._id) }
    }).lean();

    return updatedItems;
  } catch (error) {
    throw new Error('Failed to reorder menu items: ' + error.message);
  }
}

/**
 * Flatten hierarchical structure to array
 */
function flattenStructure(items, parentOrder = []) {
  let flattened = [];
  
  items.forEach((item, index) => {
    const currentItem = {
      ...item,
      order: parentOrder.concat([index]).join('.'),
      children: undefined
    };
    
    flattened.push(currentItem);
    
    if (item.children && item.children.length > 0) {
      flattened = flattened.concat(flattenStructure(item.children, parentOrder.concat([index])));
    }
  });
  
  return flattened;
}

module.exports = {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems,
  checkCircularDependency,
  hasChildren
};