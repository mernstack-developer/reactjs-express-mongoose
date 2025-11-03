const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/course.model');
const Section = require('../models/section.model');
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

    const courses = [
      { title: 'Introduction to Programming', description: 'Learn the basics of programming using Python.' },
      { title: 'Web Development', description: 'Build modern web applications using HTML, CSS, and JavaScript.' },
      { title: 'Data Structures and Algorithms', description: 'Understand fundamental data structures and algorithms.' },
   
    ];
const sections = [
      { title: 'Getting Started', description: 'Introduction to the course and setup instructions.' },
      { title: 'Basic Concepts', description: 'Learn about variables, data types, and control structures.' },
      { title: 'Advanced Topics', description: 'Explore advanced programming concepts and techniques.' },
    ];
    for (const c of courses) {
      const exists = await Course.findOne({ title: c.title });
      if (!exists) {
        let course = await Course.create({ title: c.title, description: c.description });
        console.log(`Inserted course: ${c.title}`);
        for (const s of sections) {
          await Section.create({ courseId: course._id, title: s.title, description: s.description });
          console.log(`Inserted section: ${s.title} for course: ${course._id}`);
        }
      } else {
        console.log(`Course already exists: ${c.title}`);
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