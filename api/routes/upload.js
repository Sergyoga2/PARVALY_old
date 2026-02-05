const express = require('express');
const router = express.Router();
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/security');

// Apply rate limiting to upload routes
router.use(uploadLimiter);

// Upload single image (requires auth)
router.post('/image', authenticateToken, handleUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return file information
    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: `/assets/blog/images/${req.file.filename}`,
      url: `/assets/blog/images/${req.file.filename}`
    };

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
});

// Get list of uploaded images (requires auth)
router.get('/images', authenticateToken, (req, res) => {
  try {
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, '../../assets/blog/images');

    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        success: true,
        images: []
      });
    }

    const files = fs.readdirSync(uploadsDir);
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext);
      })
      .map(file => {
        const stats = fs.statSync(path.join(uploadsDir, file));
        return {
          filename: file,
          path: `/assets/blog/images/${file}`,
          url: `/assets/blog/images/${file}`,
          size: stats.size,
          uploadedAt: stats.birthtime
        };
      })
      .sort((a, b) => b.uploadedAt - a.uploadedAt);

    res.json({
      success: true,
      count: images.length,
      images
    });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get images list'
    });
  }
});

// Delete uploaded image (requires auth)
router.delete('/image/:filename', authenticateToken, (req, res) => {
  try {
    const fs = require('fs');
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../assets/blog/images', filename);

    // Security: prevent path traversal
    const uploadsDir = path.join(__dirname, '../../assets/blog/images');
    if (!filePath.startsWith(uploadsDir)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid file path'
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
});

module.exports = router;
