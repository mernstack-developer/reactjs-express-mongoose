const { Section } = require('../models/section.model');
const Assignment = require('../models/assignment.model');
const Activity = require('../models/activity.model');

async function testCreateAssignmentActivity() {
  try {
    console.log('🧪 Testing createAssignmentActivity function...\n');
    
    // Test 1: Verify imports
    console.log('1. Checking imports...');
    console.log('   - Section:', Section ? '✅ Imported' : '❌ Failed');
    console.log('   - Section.findByIdAndUpdate:', typeof Section.findByIdAndUpdate);
    console.log('   - Assignment:', Assignment ? '✅ Imported' : '❌ Failed');
    console.log('   - Activity:', Activity ? '✅ Imported' : '❌ Failed');
    
    if (typeof Section.findByIdAndUpdate !== 'function') {
      console.log('\n❌ CRITICAL: Section.findByIdAndUpdate is not a function');
      console.log('This is the root cause of the error you\'re seeing');
      
      // Try to debug the Section object
      console.log('\n🔍 Debugging Section object:');
      console.log('   Section keys:', Object.keys(Section));
      console.log('   Section prototype keys:', Object.getOwnPropertyNames(Section.prototype));
      
      return;
    }
    
    // Test 2: Simulate the function logic (without actually saving to DB)
    console.log('\n2. Testing function logic...');
    
    // Mock data
    const mockSectionId = '507f1f77bcf86cd799439011'; // Mock ObjectId
    const mockPayload = {
      title: 'Test Assignment',
      description: 'Test Description',
      maxPoints: 100
    };
    const mockCreatorId = '507f1f77bcf86cd799439012'; // Mock ObjectId
    
    console.log('   - Mock sectionId:', mockSectionId);
    console.log('   - Mock payload:', JSON.stringify(mockPayload, null, 2));
    console.log('   - Mock creatorId:', mockCreatorId);
    
    // Test the specific line that's failing
    console.log('\n3. Testing Section.findByIdAndUpdate...');
    try {
      // This is the exact line that's failing in your code
      const result = await Section.findByIdAndUpdate(
        mockSectionId, 
        { $push: { activities: 'mockActivityId' } }
      );
      console.log('   ✅ Section.findByIdAndUpdate executed successfully');
      console.log('   Result:', result);
    } catch (error) {
      console.log('   ❌ Section.findByIdAndUpdate failed:', error.message);
    }
    
    console.log('\n🎯 Conclusion:');
    console.log('If the test above passes, the issue might be:');
    console.log('1. Database connection problems');
    console.log('2. Invalid sectionId being passed');
    console.log('3. Mongoose not properly initialized');
    
  } catch (error) {
    console.error('❌ Error in test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testCreateAssignmentActivity();