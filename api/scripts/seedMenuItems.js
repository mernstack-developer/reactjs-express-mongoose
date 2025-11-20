// /api/scripts/seedMenuItems.js

const mongoose = require('mongoose');
const MenuItem = require('../models/menuItem.model');

require('dotenv').config();

const seedMenuItems = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.DB_URI);
    console.log('Connected to MongoDB');

    // Clean up existing menu data (optional - comment out if you want to keep existing data)
    console.log('Cleaning up existing menu data...');
    await MenuItem.deleteMany({});
    console.log('Cleaned up existing menu data');

    // Define menu structure with all project routes
    const menuStructure = [
      // Main Navigation - Public Pages
      {
        name: 'Home',
        url: '/',
        icon: '🏠',
        order: 0
      },
      {
        name: 'Courses',
        url: '/courses',
        icon: '📚',
        order: 1
      },
      {
        name: 'Public Courses',
        url: '/public-courses',
        icon: '🌍',
        order: 2
      },
      {
        name: 'Categories',
        url: '/categories',
        icon: '📁',
        order: 3
      },
      {
        name: 'About Us',
        url: '/about',
        icon: 'ℹ️',
        order: 4
      },
      {
        name: 'Contact',
        url: '/contact',
        icon: '📧',
        order: 5
      },

      // Dashboard Navigation (Authenticated Users)
      {
        name: 'Dashboard',
        url: '/dashboard',
        icon: '📊',
        order: 10
      },
      {
        name: 'My Courses',
        url: '/my-courses',
        icon: '📖',
        order: 11
      },
      {
        name: 'Enrolled Courses',
        url: '/user-enrolled-courses',
        icon: '🎯',
        order: 12
      },
      {
        name: 'Profile',
        url: '/profile',
        icon: '👤',
        order: 13
      },
      {
        name: 'Calendar',
        url: '/calendar',
        icon: '📅',
        order: 14
      },
      {
        name: 'Cart',
        url: '/cart',
        icon: '🛒',
        order: 15
      },
      {
        name: 'Checkout',
        url: '/checkout',
        icon: '💳',
        order: 16
      },

      // Admin Section
      {
        name: 'Admin Panel',
        url: '/admin/dashboard',
        icon: '🛠️',
        order: 20
      },
      
      // Admin - User Management (Parent: Admin Panel)
      {
        name: 'User Management',
        url: '/admin/users',
        icon: '👥',
        parent: null, // Will be set to Admin Panel ID
        order: 0
      },
      {
        name: 'Add User',
        url: '/admin/add-user',
        icon: '➕',
        parent: null, // Will be set to Admin Panel ID
        order: 1
      },
      {
        name: 'Guest Management',
        url: '/admin/guests',
        icon: '👥',
        parent: null, // Will be set to Admin Panel ID
        order: 2
      },
      {
        name: 'Add Guest',
        url: '/admin/add-guest',
        icon: '➕',
        parent: null, // Will be set to Admin Panel ID
        order: 3
      },
      {
        name: 'Users by Role',
        url: '/admin/roles/:roleId/users',
        icon: '📋',
        parent: null, // Will be set to Admin Panel ID
        order: 4
      },

      // Admin - Course Management (Parent: Admin Panel)
      {
        name: 'Course Management',
        url: '/admin/courses',
        icon: '📚',
        parent: null, // Will be set to Admin Panel ID
        order: 0
      },
      {
        name: 'Create Course',
        url: '/admin/courses/create',
        icon: '➕',
        parent: null, // Will be set to Admin Panel ID
        order: 1
      },
      {
        name: 'Course Editor',
        url: '/admin/courses/:id/editor',
        icon: '✏️',
        parent: null, // Will be set to Admin Panel ID
        order: 2
      },
      {
        name: 'Course Enrollments',
        url: '/admin/courses/:courseId/enrollments',
        icon: '📝',
        parent: null, // Will be set to Admin Panel ID
        order: 3
      },
      {
        name: 'Admin Categories',
        url: '/admin/categories',
        icon: '📁',
        parent: null, // Will be set to Admin Panel ID
        order: 4
      },

      // Admin - System Management (Parent: Admin Panel)
      {
        name: 'Permissions',
        url: '/admin/permissions',
        icon: '🔐',
        parent: null, // Will be set to Admin Panel ID
        order: 0
      },
      {
        name: 'Roles',
        url: '/admin/roles',
        icon: '🎯',
        parent: null, // Will be set to Admin Panel ID
        order: 1
      },
      {
        name: 'User Roles',
        url: '/admin/user-roles',
        icon: '👥',
        parent: null, // Will be set to Admin Panel ID
        order: 2
      },

      // Auth Section
      {
        name: 'Sign In',
        url: '/signin',
        icon: '🔑',
        order: 30
      },
      {
        name: 'Sign Up',
        url: '/signup',
        icon: '📝',
        order: 31
      },

      // UI Components (Development/Testing)
      {
        name: 'UI Components',
        url: '/components',
        icon: '🧩',
        order: 40
      },
      {
        name: 'Form Elements',
        url: '/form-elements',
        icon: '📝',
        parent: null, // Will be set to UI Components ID
        order: 0
      },
      {
        name: 'Alerts',
        url: '/alerts',
        icon: '⚠️',
        parent: null, // Will be set to UI Components ID
        order: 1
      },
      {
        name: 'Avatars',
        url: '/avatars',
        icon: '👤',
        parent: null, // Will be set to UI Components ID
        order: 2
      },
      {
        name: 'Badges',
        url: '/badges',
        icon: '🏆',
        parent: null, // Will be set to UI Components ID
        order: 3
      },
      {
        name: 'Buttons',
        url: '/buttons',
        icon: '🔘',
        parent: null, // Will be set to UI Components ID
        order: 4
      },
      {
        name: 'Images',
        url: '/images',
        icon: '🖼️',
        parent: null, // Will be set to UI Components ID
        order: 5
      },
      {
        name: 'Videos',
        url: '/videos',
        icon: '🎥',
        parent: null, // Will be set to UI Components ID
        order: 6
      },
      {
        name: 'Line Chart',
        url: '/line-chart',
        icon: '📈',
        parent: null, // Will be set to UI Components ID
        order: 7
      },
      {
        name: 'Bar Chart',
        url: '/bar-chart',
        icon: '📊',
        parent: null, // Will be set to UI Components ID
        order: 8
      },

      // Utility Pages
      {
        name: 'Blank Page',
        url: '/blank',
        icon: '📄',
        order: 50
      },
      {
        name: '404 Not Found',
        url: '/404',
        icon: '❓',
        order: 51
      }
    ];

    console.log('Creating menu items...');

    // First, create all menu items without parent references
    const createdItems = [];
    for (let i = 0; i < menuStructure.length; i++) {
      const menuItemData = menuStructure[i];
      
      const menuItem = new MenuItem({
        name: menuItemData.name,
        url: menuItemData.url,
        icon: menuItemData.icon,
        order: menuItemData.order,
        parent: null // Will be set later for child items
      });

      await menuItem.save();
      createdItems.push(menuItem);
      console.log(`Created: ${menuItem.name} (${menuItem._id})`);
    }

    // Now set up parent-child relationships
    console.log('Setting up parent-child relationships...');

    // Find parent items
    const adminPanel = createdItems.find(item => item.name === 'Admin Panel');
    const uiComponents = createdItems.find(item => item.name === 'UI Components');

    // Update child items with parent references
    const updates = [];

    // Admin Panel children
    const adminChildren = [
      'User Management', 'Add User', 'Guest Management', 'Add Guest', 'Users by Role',
      'Course Management', 'Create Course', 'Course Editor', 'Course Enrollments', 'Admin Categories',
      'Permissions', 'Roles', 'User Roles'
    ];

    adminChildren.forEach((childName, index) => {
      const childItem = createdItems.find(item => item.name === childName);
      if (childItem) {
        updates.push({
          updateOne: {
            filter: { _id: childItem._id },
            update: { parent: adminPanel._id, order: index }
          }
        });
      }
    });

    // UI Components children
    const uiChildren = [
      'Form Elements', 'Alerts', 'Avatars', 'Badges', 'Buttons', 'Images', 'Videos',
      'Line Chart', 'Bar Chart'
    ];

    uiChildren.forEach((childName, index) => {
      const childItem = createdItems.find(item => item.name === childName);
      if (childItem) {
        updates.push({
          updateOne: {
            filter: { _id: childItem._id },
            update: { parent: uiComponents._id, order: index }
          }
        });
      }
    });

    // Apply bulk updates
    if (updates.length > 0) {
      await MenuItem.bulkWrite(updates);
      console.log(`Updated ${updates.length} items with parent references`);
    }

    console.log('\n🎉 Menu seeding completed successfully!');
    console.log(`\n📊 Menu Structure Overview:`);
    console.log(`├── Public Navigation (${menuStructure.filter(m => m.order < 10).length} items)`);
    console.log(`├── Dashboard Navigation (${menuStructure.filter(m => m.order >= 10 && m.order < 20).length} items)`);
    console.log(`├── Admin Panel (${adminChildren.length} sub-items)`);
    console.log(`├── Auth Section (${menuStructure.filter(m => m.order >= 30 && m.order < 40).length} items)`);
    console.log(`├── UI Components (${uiChildren.length} sub-items)`);
    console.log(`└── Utility Pages (${menuStructure.filter(m => m.order >= 50).length} items)`);
    
    console.log(`\n📈 Total Menu Items Created: ${createdItems.length}`);
    console.log(`\n🎯 Key Features Seeded:`);
    console.log(`✅ Public course browsing`);
    console.log(`✅ User dashboard and profile`);
    console.log(`✅ Admin course management`);
    console.log(`✅ User and role management`);
    console.log(`✅ UI component library`);
    console.log(`✅ Authentication flows`);
    console.log(`✅ Comprehensive navigation structure`);

    // Display the menu structure
    console.log('\n📋 Complete Menu Structure:');
    console.log('Public Navigation:');
    menuStructure.filter(m => m.order < 10).forEach(item => {
      console.log(`  ├── ${item.icon} ${item.name} → ${item.url}`);
    });

    console.log('\nDashboard Navigation:');
    menuStructure.filter(m => m.order >= 10 && m.order < 20).forEach(item => {
      console.log(`  ├── ${item.icon} ${item.name} → ${item.url}`);
    });

    console.log('\nAdmin Panel:');
    adminChildren.forEach(child => {
      const item = createdItems.find(i => i.name === child);
      console.log(`  ├── ${item?.icon || '📋'} ${child} → ${item?.url || 'N/A'}`);
    });

    console.log('\nAuth Section:');
    menuStructure.filter(m => m.order >= 30 && m.order < 40).forEach(item => {
      console.log(`  ├── ${item.icon} ${item.name} → ${item.url}`);
    });

    console.log('\nUI Components:');
    uiChildren.forEach(child => {
      const item = createdItems.find(i => i.name === child);
      console.log(`  ├── ${item?.icon || '🧩'} ${child} → ${item?.url || 'N/A'}`);
    });

    console.log('\nUtility Pages:');
    menuStructure.filter(m => m.order >= 50).forEach(item => {
      console.log(`  ├── ${item.icon} ${item.name} → ${item.url}`);
    });

  } catch (error) {
    console.error('Error seeding menu data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeding script
if (require.main === module) {
  seedMenuItems();
}

module.exports = seedMenuItems;