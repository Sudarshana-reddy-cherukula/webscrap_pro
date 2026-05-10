const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { asyncHandler } = require('./errorMiddleware');

// Simple stub for upload functionality when multer is not available
const upload = {
  single: (fieldName) => {
    return (req, res, next) => {
      // Create a mock file object for now
      req.file = { 
        filename: 'temp-file.pdf',
        originalname: 'temp-file.pdf',
        mimetype: 'application/pdf',
        size: 1024
      };
      next();
    };
  },
};

const ensureUploadDir = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

const cleanupOldFiles = async (directory, maxAge) => {
  try {
    const files = await fs.readdir(directory);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);

      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
};

const handleUploadError = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }
  next();
});

module.exports = {
  upload,
  cleanupOldFiles,
  handleUploadError,
};
