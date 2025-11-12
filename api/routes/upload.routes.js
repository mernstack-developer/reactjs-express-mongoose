const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadController = require('../controllers/upload.controller');

router.post('/', upload.single('file'), uploadController.uploadFile);

module.exports = router;
