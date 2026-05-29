const express = require('express');
const router = express.Router();
const scrapingController = require('../controllers/scrapingController');
const { protect } = require('../middlewares/authMiddleware');
const { validateRequest, validateParams } = require('../middlewares/validationMiddleware');
const {
  scrapeUrlSchema,
  scrapeImagesSchema,
  scrapeLinksSchema,
  scrapeMetadataSchema,
  jobStatusSchema,
} = require('../validations');

router.post('/pause/:jobId', protect, scrapingController.pauseJob);
router.post('/resume/:jobId', protect, scrapingController.resumeJob);
router.post('/url', protect, validateRequest(scrapeUrlSchema), scrapingController.scrapeUrl);
router.post('/images', protect, validateRequest(scrapeImagesSchema), scrapingController.scrapeImages);
router.post('/links', protect, validateRequest(scrapeLinksSchema), scrapingController.scrapeLinks);
router.post('/metadata', protect, validateRequest(scrapeMetadataSchema), scrapingController.scrapeMetadata);
router.get('/status/:jobId', protect, validateParams(jobStatusSchema), scrapingController.getJobStatus);
router.get('/results/:jobId', protect, validateParams(jobStatusSchema), scrapingController.getJobResults);
router.delete('/delete/:jobId', protect, validateParams(jobStatusSchema), scrapingController.deleteJob);
router.get('/jobs', protect, scrapingController.getUserJobs);

module.exports = router;
