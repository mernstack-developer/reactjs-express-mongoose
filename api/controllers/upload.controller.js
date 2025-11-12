const uploadService = require('../services/upload.service');

async function uploadFile(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const file = req.file;
    const result = await uploadService.uploadToVercel(file.originalname, file.buffer, file.mimetype);
    // result may contain url or key depending on Vercel response
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
}

module.exports = { uploadFile };
