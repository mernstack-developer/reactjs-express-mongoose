const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

async function uploadToVercel(name, buffer, mimeType) {
  try {
    // Check if we have Vercel token for production
    const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
    if (BLOB_TOKEN) {
      const fetch = global.fetch || require('node-fetch');
      const url = `https://api.vercel.com/v1/blob?name=${encodeURIComponent(name)}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${BLOB_TOKEN}`,
          'Content-Type': mimeType || 'application/octet-stream',
        },
        body: buffer,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${res.status} ${text}`);
      }
      const data = await res.json();
      return data;
    }
  } catch (vercelError) {
    console.log('Vercel upload failed, falling back to local storage:', vercelError.message);
  }

  // Fallback to local file storage for development
  const uploadsDir = path.join(__dirname, '../../uploads');
  
  // Create uploads directory if it doesn't exist
  try {
    await fs.access(uploadsDir);
  } catch (error) {
    await fs.mkdir(uploadsDir, { recursive: true });
  }

  // Generate unique filename
  const fileExtension = path.extname(name);
  const fileName = `${crypto.randomBytes(8).toString('hex')}_${name}`;
  const filePath = path.join(uploadsDir, fileName);
  
  // Save file
  await fs.writeFile(filePath, buffer);
  
  // Return relative URL that can be accessed
  const relativePath = `/uploads/${fileName}`;
  
  return {
    filename: name,
    url: relativePath,
    size: buffer.length,
    mimetype: mimeType
  };
}

module.exports = { uploadToVercel };
