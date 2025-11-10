// seed.js
require('dotenv').config(); // Load environment variables

const mongoose = require('mongoose');
const Permission = require('../models/permission.model');
const Role = require('../models/role.model');
const User = require('../models/user.model');
const mongoUri = process.env.MONGODB_URI || process.env.DB_URI;

const connectDB = async () => {
    try {
        if (!mongoUri) {
            console.error('No MongoDB connection string found in MONGODB_URI or DB_URI');
            process.exit(1);
        }
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected for Seeding');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const permissionsList = [
    { name: 'view_course', description: 'View any course content' },
    { name: 'edit_course', description: 'Edit course details and sections' },
    { name: 'delete_course', description: 'Delete a course' },
    { name: 'enroll_students', description: 'Enroll students in courses' },
    { name: 'submit_assignment', description: 'Submit assignments' },
];

const rolesList = [
    { name: 'student', description: 'Default learner role', permissions: ['view_course', 'submit_assignment'] },
    { name: 'instructor', description: 'Course creator role', permissions: ['view_course', 'edit_course', 'enroll_students'] },
    { name: 'admin', description: 'System administrator role', permissions: permissionsList.map(c => c.name) },
];

async function seedUsers() {
    try {
          await connectDB();
        const adminRole = await Role.findOne({ name: 'admin' });
        const studentRole = await Role.findOne({ name: 'student' });
        const instructorRole = await Role.findOne({ name: 'instructor' });
        if (!adminRole) {
            console.error("Admin role not found. Cannot seed default user. Ensure roles are seeded first.");
            return;
        }
        const bcrypt = require('bcryptjs');
        const users = [
            {
                firstname: 'Alice Test', lastname: 'Test', email: 'alice.test@example.com', phone: '123-456-7890',
                role: adminRole._id, // Assign the ObjectId of the admin role
                password: 'password123', bio: 'Admin user'
            },
            {
                firstname: 'Bob Test', lastname: 'Test', email: 'bob.test@example.com', phone: '123-456-7890',
                role: instructorRole._id,
                password: 'password123', bio: 'Regular user'
            },
            {
                firstname: 'Carol Test', lastname: 'Test', email: 'carol.test@example.com', phone: '123-456-7890',
                role: studentRole._id,
                password: 'password123', bio: 'Regular user'
            },
        ];

        for (const u of users) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                const hashed = await bcrypt.hash(u.password, 10);
                await User.create({ firstname: u.firstname, lastname: u.lastname, email: u.email, phone: u.phone, role: u.role, password: hashed, bio: u.bio });
                console.log(`Inserted ${u.email}`);
            } else {
                console.log(`${u.email} already exists`);
            }
        }

        console.log('Seeding finished');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed', err);
        process.exit(1);
    }
}
const seedDB = async () => {
    await connectDB();

    try {
        // 1. Seed Capabilities and store their IDs
        const seededPermissions = {};
        for (const permission of permissionsList) {
            const createdPermission = await Permission.findOneAndUpdate(
                { name: permission.name },
                permission,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            seededPermissions[permission.name] = createdPermission._id;
        }
        console.log('Capabilities Seeded Successfully');

        // 2. Seed Roles
        for (const role of rolesList) {
            const permissionIds = role.permissions.map(permissionName => seededPermissions[permissionName]);
            await Role.findOneAndUpdate(
                { name: role.name }, { ...role, permissions: permissionIds }, { upsert: true, new: true, setDefaultsOnInsert: true });
        }
        console.log('Roles Seeded Successfully');
        seedUsers();
        console.log('Database Seeding Complete!');

    } catch (error) {
        console.error('Error seeding database:', error);
        mongoose.connection.close();
        process.exit(1);
    }
};


seedDB();

