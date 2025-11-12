const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/user.model');
const Course = require('./models/course.model');
const Category = require('./models/category.model');
const Section = require('./models/section.model');
const Activity = require('./models/activity.model');

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.DB_URI);
    
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    const categoryCount = await Category.countDocuments();
    const sectionCount = await Section.countDocuments();
    const activityCount = await Activity.countDocuments();
    
    console.log('\n=== SEED VERIFICATION ===');
    console.log(`Users created: ${userCount} (expected: 220 = 20 instructors + 200 students)`);
    console.log(`Courses created: ${courseCount} (expected: 100)`);
    console.log(`Categories created: ${categoryCount} (expected: 100 = 50 categories + 50 subcategories)`);
    console.log(`Sections created: ${sectionCount} (expected: 300 = 3 per course)`);
    console.log(`Activities created: ${activityCount} (expected: 600 = 2 per section)`);
    
    // Sample course with sections and activities
    const sample = await Course.findOne().populate('category').populate('subcategory').populate('sections');
    if (sample) {
      console.log(`\nSample course: ${sample.title}`);
      console.log(`  Instructor: ${sample.instructor}`);
      console.log(`  Category: ${sample.category ? sample.category.name : 'none'}`);
      console.log(`  Sections count: ${sample.sections ? sample.sections.length : 0}`);
    }
    
    // Check activities in a section
    const sampleSection = await Section.findOne().populate('activities');
    if (sampleSection) {
      console.log(`\nSample section: ${sampleSection.title}`);
      console.log(`  Activities: ${sampleSection.activities ? sampleSection.activities.length : 0}`);
      if (sampleSection.activities && sampleSection.activities.length > 0) {
        sampleSection.activities.forEach((activity, idx) => {
          console.log(`    Activity ${idx+1}: ${activity.type} - ${activity.title}`);
        });
      }
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Verification failed', err);
  }
}

verify();
