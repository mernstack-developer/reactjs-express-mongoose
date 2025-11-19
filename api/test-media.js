const axios = require('axios');

// Test script to verify media functionality
const API_BASE = 'http://localhost:3000/api';

async function testMediaFunctionality() {
  console.log('Testing media functionality...\n');

  try {
    // Test 1: Create a section with media
    console.log('1. Testing section creation with media...');
    const sectionData = {
      title: 'Test Section with Media',
      description: 'This is a test section with video media',
      media: {
        type: 'video',
        url: 'https://example.com/test-video.mp4',
        thumbnail: 'https://example.com/thumbnail.jpg',
        alt: 'Test video'
      }
    };

    const createResponse = await axios.post(`${API_BASE}/sections`, sectionData);
    console.log('✅ Section created with media:', createResponse.data.data.media);

    const sectionId = createResponse.data.data._id;

    // Test 2: Update section media
    console.log('\n2. Testing section media update...');
    const updateData = {
      media: {
        type: 'image',
        url: 'https://example.com/test-image.jpg',
        alt: 'Test image'
      }
    };

    const updateResponse = await axios.put(`${API_BASE}/sections/${sectionId}`, updateData);
    console.log('✅ Section media updated:', updateResponse.data.data.media);

    // Test 3: Get section to verify media is saved
    console.log('\n3. Testing section retrieval...');
    const getResponse = await axios.get(`${API_BASE}/sections/${sectionId}`);
    console.log('✅ Section retrieved with media:', getResponse.data.data.media);

    console.log('\n🎉 All media tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMediaFunctionality();
}

module.exports = { testMediaFunctionality };