const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Notification =require( '../models/notification.model') // Adjust path to your model


// Load environment variables from .env file
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding.');

    // Clear existing notifications
    await Notification.deleteMany({});
    console.log('Existing notifications cleared.');

    // Generate dummy notifications
    const dummyNotifications = [];
    const recipientId = 'user123'; // Use a consistent recipient ID for testing

    for (let i = 0; i < 20; i++) {
      dummyNotifications.push({
        message: `This is a test notification number ${i + 1}`,
        recipient_id: recipientId,
        read: Math.random() > 0.5, // Randomly set read status
        // Mongoose handles createdAt timestamp automatically with 'timestamps: true' in schema
      });
    }

    // Insert new notifications
    await Notification.insertMany(dummyNotifications);
    console.log(`Seeded ${dummyNotifications.length} notifications successfully.`);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    // Disconnect from the database after seeding is done
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

seedDatabase();
