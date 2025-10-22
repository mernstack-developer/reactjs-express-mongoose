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

    const bcrypt = require('bcryptjs');
    const users = [
      { name: 'Alice Test', email: 'alice.test@example.com', role: 'admin', password: 'password123' },
      { name: 'Bob Test', email: 'bob.test@example.com', role: 'user', password: 'password123' },
      { name: 'Carol Test', email: 'carol.test@example.com', role: 'user', password: 'password123' },
    ];

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const hashed = await bcrypt.hash(u.password, 10);
        await User.create({ name: u.name, email: u.email, role: u.role, password: hashed });
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
