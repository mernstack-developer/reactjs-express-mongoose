const mongoose = require('mongoose');
const { Section } = require('../models/section.model');
const Assignment = require('../models/assignment.model');
const Activity = require('../models/activity.model');
const Enrollment = require('../models/enrollment.model');

async function testModels() {
  try {
    console.log('🧪 Testing Mongoose Models...\n');
    
    // Test 1: Check if Section model has static methods
    console.log('1. Testing Section model methods...');
    console.log('   - findByIdAndUpdate:', typeof Section.findByIdAndUpdate);
    console.log('   - findById:', typeof Section.findById);
    console.log('   - find:', typeof Section.find);
    console.log('   - create:', typeof Section.create);
    
    if (typeof Section.findByIdAndUpdate !== 'function') {
      console.log('   ❌ Section.findByIdAndUpdate is not a function!');
      console.log('   This suggests the model is not properly exported/imported');
    } else {
      console.log('   ✅ Section model methods are available');
    }
    
    // Test 2: Check other models
    console.log('\n2. Testing other models...');
    console.log('   - Assignment.findByIdAndUpdate:', typeof Assignment.findByIdAndUpdate);
    console.log('   - Activity.create:', typeof Activity.create);
    console.log('   - Enrollment.find:', typeof Enrollment.find);
    
    // Test 3: Try a simple database operation (if connected)
    console.log('\n3. Testing database connection...');
    if (mongoose.connection.readyState === 1) {
      try {
        const sectionCount = await Section.countDocuments();
        console.log(`   ✅ Database connected, found ${sectionCount} sections`);
      } catch (dbError) {
        console.log('   ❌ Database query failed:', dbError.message);
      }
    } else {
      console.log('   ⚠️  Database not connected (expected if not running)');
      console.log('   Connection state:', mongoose.connection.readyState);
    }
    
    console.log('\n🎯 Summary:');
    console.log('- If Section.findByIdAndUpdate is not a function, check the model export/import');
    console.log('- Make sure mongoose is connected before testing database operations');
    console.log('- Verify the model file exports the correct structure');
    
  } catch (error) {
    console.error('❌ Error testing models:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testModels();