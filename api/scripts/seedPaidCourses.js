const mongoose = require('mongoose');
const Course = require('../models/course.model');
const Category = require('../models/category.model');

require('dotenv').config();

const seedPaidCourses = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.DB_URI;
    
    if (!mongoUri) {
      console.error('No MongoDB connection string found');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if we already have paid courses
    const existingPaidCourses = await Course.countDocuments({ enrollmentType: 'paid' });
    
    if (existingPaidCourses > 0) {
      console.log(`Found ${existingPaidCourses} paid courses already. Skipping seeding.`);
      await mongoose.disconnect();
      return;
    }

    // Find or create categories for courses
    let programmingCategory = await Category.findOne({ name: 'Programming' });
    if (!programmingCategory) {
      programmingCategory = new Category({
        name: 'Programming',
        slug: 'programming'
      });
      await programmingCategory.save();
      console.log('Created Programming category');
    }

    let webDevCategory = await Category.findOne({ name: 'Web Development' });
    if (!webDevCategory) {
      webDevCategory = new Category({
        name: 'Web Development',
        slug: 'web-development'
      });
      await webDevCategory.save();
      console.log('Created Web Development category');
    }

    let dataScienceCategory = await Category.findOne({ name: 'Data Science' });
    if (!dataScienceCategory) {
      dataScienceCategory = new Category({
        name: 'Data Science',
        slug: 'data-science'
      });
      await dataScienceCategory.save();
      console.log('Created Data Science category');
    }

    // Paid courses to seed
    const paidCourses = [
      {
        title: 'Complete React & TypeScript Development',
        description: 'Master React 19 and TypeScript by building real-world applications. Learn modern hooks, component architecture, state management, and advanced patterns used in production.',
        imageUrl: 'https://images.unsplash.com/photo-1611944429455-d1e9ef1f98e5?w=400&h=300&fit=crop',
        instructor: 'Sarah Johnson',
        duration: 40,
        enrollmentType: 'paid',
        price: 2999,
        currency: 'INR',
        category: programmingCategory._id,
        tags: ['React', 'TypeScript', 'Frontend', 'JavaScript'],
        isPublic: true,
        thumbnail: 'https://images.unsplash.com/photo-1611944429455-d1e9ef1f98e5?w=200&h=150&fit=crop'
      },
      {
        title: 'Advanced Node.js & Express Backend Development',
        description: 'Build scalable backend applications with Node.js, Express, and MongoDB. Learn authentication, authorization, API design, database optimization, and deployment strategies.',
        imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=300&fit=crop',
        instructor: 'Michael Chen',
        duration: 35,
        enrollmentType: 'paid',
        price: 2499,
        currency: 'INR',
        category: webDevCategory._id,
        tags: ['Node.js', 'Express', 'Backend', 'MongoDB', 'API'],
        isPublic: true,
        thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=200&h=150&fit=crop'
      },
      {
        title: 'Machine Learning with Python - From Zero to Hero',
        description: 'Comprehensive machine learning course covering supervised and unsupervised learning, neural networks, deep learning, and real-world projects using Python and popular libraries.',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
        instructor: 'Dr. Lisa Wang',
        duration: 50,
        enrollmentType: 'paid',
        price: 3999,
        currency: 'INR',
        category: dataScienceCategory._id,
        tags: ['Machine Learning', 'Python', 'AI', 'Data Science', 'Neural Networks'],
        isPublic: true,
        thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=150&fit=crop'
      },
      {
        title: 'Full-Stack MERN Development Bootcamp',
        description: 'Complete full-stack web development course using MongoDB, Express, React, and Node.js. Build 5 real projects from scratch and deploy them to production.',
        imageUrl: 'https://images.unsplash.com/photo-1581084193403-cd8c0dfc0f5d?w=400&h=300&fit=crop',
        instructor: 'Alex Rodriguez',
        duration: 60,
        enrollmentType: 'paid',
        price: 4999,
        currency: 'INR',
        category: webDevCategory._id,
        tags: ['MERN', 'Full-Stack', 'MongoDB', 'Express', 'React', 'Node.js'],
        isPublic: true,
        thumbnail: 'https://images.unsplash.com/photo-1581084193403-cd8c0dfc0f5d?w=200&h=150&fit=crop'
      },
      {
        title: 'AWS Cloud Certification - Solutions Architect Associate',
        description: 'Prepare for AWS Solutions Architect Associate certification. Learn cloud architecture, AWS services, security, and cost optimization with hands-on labs.',
        imageUrl: 'https://images.unsplash.com/photo-1487222477894-8943e31ef797?w=400&h=300&fit=crop',
        instructor: 'James Wilson',
        duration: 45,
        enrollmentType: 'paid',
        price: 3499,
        currency: 'INR',
        category: programmingCategory._id,
        tags: ['AWS', 'Cloud Computing', 'DevOps', 'Certification'],
        isPublic: true,
        thumbnail: 'https://images.unsplash.com/photo-1487222477894-8943e31ef797?w=200&h=150&fit=crop'
      },
      {
        title: 'React Native - Build iOS and Android Apps',
        description: 'Learn to build native mobile applications using React Native. Create cross-platform apps with native performance and deploy to both App Store and Google Play.',
        imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
        instructor: 'Emma Thompson',
        duration: 30,
        enrollmentType: 'paid',
        price: 2299,
        currency: 'INR',
        category: programmingCategory._id,
        tags: ['React Native', 'Mobile Development', 'iOS', 'Android', 'Cross-platform'],
        isPublic: true,
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=150&fit=crop'
      }
    ];

    // Create the courses
    console.log('Seeding paid courses...');
    
    for (const courseData of paidCourses) {
      const course = new Course(courseData);
      await course.save();
      console.log(`Created course: ${course.title}`);
    }

    console.log('✅ Successfully seeded 6 paid courses');
    console.log('💰 Course prices range from ₹2,299 to ₹4,999');
    console.log('🎓 Categories: Programming, Web Development, Data Science');

  } catch (error) {
    console.error('❌ Error seeding paid courses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed script
seedPaidCourses();