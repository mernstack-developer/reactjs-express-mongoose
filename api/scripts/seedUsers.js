const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');

dotenv.config();

const mongoUri = process.env.MONGODB_URI || process.env.DB_URI;
if (!mongoUri) {
  console.error('No MongoDB connection string found in MONGODB_URI or DB_URI');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding');
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

seed();
