const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');
const { validateRequest, validateParams } = require('../middlewares/validationMiddleware');
const {
  extractTextSchema,
  extractImagesSchema,
  extractMetadataSchema,
  convertToDocxSchema,
  convertToTxtSchema,
  jobStatusSchema,
} = require('../validations');

router.post('/extract-text', protect, upload.single('pdf'), validateRequest(extractTextSchema), pdfController.extractText);
router.post('/extract-images', protect, upload.single('pdf'), validateRequest(extractImagesSchema), pdfController.extractImages);
router.post('/extract-metadata', protect, upload.single('pdf'), validateRequest(extractMetadataSchema), pdfController.extractMetadata);
router.post('/convert-to-docx', protect, upload.single('pdf'), validateRequest(convertToDocxSchema), pdfController.convertToDocx);
router.post('/convert-to-txt', protect, upload.single('pdf'), validateRequest(convertToTxtSchema), pdfController.convertToTxt);
router.get('/status/:jobId', protect, validateParams(jobStatusSchema), pdfController.getJobStatus);
router.get('/results/:jobId', protect, validateParams(jobStatusSchema), pdfController.getJobResults);
router.delete('/delete/:jobId', protect, validateParams(jobStatusSchema), pdfController.deleteJob);
router.get('/jobs', protect, pdfController.getUserJobs);
router.get('/download/:jobId', protect, validateParams(jobStatusSchema), pdfController.downloadProcessedFile);

module.exports = router;
