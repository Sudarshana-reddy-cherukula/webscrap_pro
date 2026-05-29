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
  modifyTextSchema,
  addWatermarkSchema,
  addSecuritySchema,
  splitPdfSchema,
  mergePdfSchema,
  rotatePagesSchema,
  cropPagesSchema,
  jobStatusSchema,
} = require('../validations');

router.post('/extract-text', protect, upload.single('pdf'), validateRequest(extractTextSchema), pdfController.extractText);
router.post('/extract-images', protect, upload.single('pdf'), validateRequest(extractImagesSchema), pdfController.extractImages);
router.post('/extract-metadata', protect, upload.single('pdf'), validateRequest(extractMetadataSchema), pdfController.extractMetadata);
router.post('/convert-to-docx', protect, upload.single('pdf'), validateRequest(convertToDocxSchema), pdfController.convertToDocx);
router.post('/convert-to-txt', protect, upload.single('pdf'), validateRequest(convertToTxtSchema), pdfController.convertToTxt);
router.post('/modify-text', protect, upload.single('pdf'), validateRequest(modifyTextSchema), pdfController.modifyText);
router.post('/add-watermark', protect, upload.single('pdf'), validateRequest(addWatermarkSchema), pdfController.addWatermark);
router.post('/add-security', protect, upload.single('pdf'), validateRequest(addSecuritySchema), pdfController.addSecurity);
router.post('/split', protect, upload.single('pdf'), validateRequest(splitPdfSchema), pdfController.splitPdf);
router.post('/merge', protect, upload.array('pdf', 20), validateRequest(mergePdfSchema), pdfController.mergePdf);
router.post('/rotate', protect, upload.single('pdf'), validateRequest(rotatePagesSchema), pdfController.rotatePages);
router.post('/crop', protect, upload.single('pdf'), validateRequest(cropPagesSchema), pdfController.cropPages);
router.get('/status/:jobId', protect, validateParams(jobStatusSchema), pdfController.getJobStatus);
router.get('/results/:jobId', protect, validateParams(jobStatusSchema), pdfController.getJobResults);
router.delete('/delete/:jobId', protect, validateParams(jobStatusSchema), pdfController.deleteJob);
router.get('/jobs', protect, pdfController.getUserJobs);
router.get('/download/:jobId', protect, validateParams(jobStatusSchema), pdfController.downloadProcessedFile);

module.exports = router;
