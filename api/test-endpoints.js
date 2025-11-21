const fetch = require('node-fetch');

async function testAPIEndpoints() {
  const baseUrl = 'http://localhost:3000/api';
  
  console.log('🧪 Testing API Endpoints...\n');
  
  // Test 1: Assignment creation endpoint
  console.log('1. Testing assignment creation endpoint...');
  try {
    const assignmentResponse = await fetch(`${baseUrl}/assignments/create-activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth but tests route exists
      },
      body: JSON.stringify({
        sectionId: 'test-section',
        assignment: {
          title: 'Test Assignment',
          description: 'Test Description',
          maxPoints: 100
        }
      })
    });
    
    if (assignmentResponse.status === 401) {
      console.log('✅ Assignment endpoint exists (got 401 Unauthorized as expected)');
    } else if (assignmentResponse.status === 404) {
      console.log('❌ Assignment endpoint not found (404)');
    } else {
      console.log(`⚠️  Assignment endpoint returned: ${assignmentResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Assignment endpoint error:', error.message);
  }
  
  // Test 2: Upload endpoint
  console.log('\n2. Testing upload endpoint...');
  try {
    // Create a simple text file for testing
    const formData = new FormData();
    formData.append('file', new Blob(['test content'], { type: 'text/plain' }), 'test.txt');
    
    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (uploadResponse.status === 500) {
      console.log('❌ Upload endpoint returning 500 error');
    } else if (uploadResponse.status === 404) {
      console.log('❌ Upload endpoint not found (404)');
    } else {
      console.log(`✅ Upload endpoint returned: ${uploadResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Upload endpoint error:', error.message);
  }
  
  // Test 3: Check if server is running
  console.log('\n3. Testing server health...');
  try {
    const healthResponse = await fetch(`${baseUrl}/greeting`);
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log('✅ Server is running:', data.message);
    } else {
      console.log('❌ Server health check failed');
    }
  } catch (error) {
    console.log('❌ Server not accessible:', error.message);
  }
  
  console.log('\n🎯 Summary:');
  console.log('- Assignment endpoint: Should return 401 (auth required) or 404 (not found)');
  console.log('- Upload endpoint: Should return 200 (success) or 500 (server error)');
  console.log('- If assignment returns 404, check route registration');
  console.log('- If upload returns 500, check upload service implementation');
}

testAPIEndpoints().catch(console.error);