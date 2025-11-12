const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const User = require('../models/user.model');
const Course = require('../models/course.model');
const Section = require('../models/section.model');
const Category = require('../models/category.model');
const Activity = require('../models/activity.model');
const Role = require('../models/role.model');

dotenv.config();

const mongoUri = process.env.MONGODB_URI || process.env.DB_URI;
if (!mongoUri) {
  console.error('No MongoDB connection string found in MONGODB_URI or DB_URI');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for seeding categories and courses');

    // Clean up partial seed (optional)
    // await Course.deleteMany({});
    // await Section.deleteMany({});
    // await Category.deleteMany({});
    // await User.deleteMany({});

    // Ensure roles exist (skip if roles seeded elsewhere)
    const Role = require('../models/role.model');
    let studentRole = await Role.findOne({ name: 'student' });
    let instructorRole = await Role.findOne({ name: 'instructor' });
    if (!studentRole || !instructorRole) {
      console.log('Roles not seeded. Please run seedPermissions/roles first.');
    }

    // Create instructors
    const instructors = [];
    for (let i = 0; i < 20; i++) {
      const email = `instructor${i}@example.com`;
      let user = await User.findOne({ email });
      if (!user) {
        const hashed = await bcrypt.hash('password123', 10);
        user = await User.create({ firstname: faker.person.firstName(), lastname: faker.person.lastName(), email, password: hashed, role: instructorRole ? instructorRole._id : undefined });
        console.log(`Created instructor ${email}`);
      }
      instructors.push(user);
    }

    // Create students
    const students = [];
    for (let i = 0; i < 200; i++) {
      const email = `student${i}@example.com`;
      let user = await User.findOne({ email });
      if (!user) {
        const hashed = await bcrypt.hash('password123', 10);
        user = await User.create({ firstname: faker.person.firstName(), lastname: faker.person.lastName(), email, password: hashed, role: studentRole ? studentRole._id : undefined });
      }
      students.push(user);
    }

    // Create 50 categories each with 1 subcategory (total 50 categories + 50 subcategories = 100 items)
    const categories = [];
    const subcategories = [];
    for (let i = 0; i < 50; i++) {
      const name = `Category ${i + 1}`;
      let cat = await Category.findOne({ name });
      if (!cat) {
        cat = await Category.create({ name, slug: `category-${i + 1}` });
      }
      categories.push(cat);

      // create one subcategory for each
      const subName = `Category ${i + 1} - Sub`; 
      let sub = await Category.findOne({ name: subName });
      if (!sub) {
        sub = await Category.create({ name: subName, slug: `category-${i + 1}-sub`, parent: cat._id });
      }
      subcategories.push(sub);
    }

    // Create 100 courses and assign random categories/subcategories and instructors
    const courses = [];
    for (let i = 0; i < 100; i++) {
      const title = `Seeded Course ${i + 1}: ${faker.company.catchPhrase()}`;
      let course = await Course.findOne({ title });
      if (!course) {
        const instructor = instructors[Math.floor(Math.random() * instructors.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const subcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
        course = await Course.create({ title, description: faker.lorem.paragraph(), instructor: instructor._id || instructor.email, createdBy: instructor._id, isPublic: true, enrollmentType: 'free', category: category._id, subcategory: subcategory._id, price: 0, tags: [faker.word.noun(), faker.word.verb()] });
        console.log(`Created course ${title}`);

        // create 3 sections per course with activities
        for (let s = 0; s < 3; s++) {
          const section = await Section.create({ courseId: course._id, title: `Section ${s + 1}`, description: faker.lorem.sentence() });
          
          // create 2 activities per section (video + quiz)
          const activityTypes = ['video', 'assignment'];
          for (let a = 0; a < 2; a++) {
            const activity = await Activity.create({
              type: activityTypes[a],
              title: `${activityTypes[a].charAt(0).toUpperCase() + activityTypes[a].slice(1)} ${a + 1}`,
              description: faker.lorem.sentence(),
              createdBy: instructor._id,
              config: { duration: Math.floor(Math.random() * 60) + 5 }
            });
            await Section.findByIdAndUpdate(section._id, { $push: { activities: activity._id } });
          }
        }
      }
      courses.push(course);
    }

    // Enroll random students into courses
    for (const course of courses) {
      const enrollCount = Math.floor(Math.random() * 20); // up to 20 students
      const shuffled = students.sort(() => 0.5 - Math.random());
      const toEnroll = shuffled.slice(0, enrollCount);
      for (const stu of toEnroll) {
        // ensure no duplicates
        if (!course.registeredUsers || !course.registeredUsers.includes(stu._id)) {
          await Course.findByIdAndUpdate(course._id, { $addToSet: { registeredUsers: stu._id } });
        }
      }
      console.log(`Enrolled ${enrollCount} students into course ${course.title}`);
    }

    console.log('Seeding categories, courses, users and enrollments finished');
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
