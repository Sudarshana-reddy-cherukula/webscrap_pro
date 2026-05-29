const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/overview', protect, analyticsController.getOverview);
router.get('/trends', protect, analyticsController.getTrends);
router.get('/frequency', protect, analyticsController.getFrequency);
router.get('/keywords', protect, analyticsController.getKeywords);
router.get('/job/:jobId', protect, analyticsController.getJobAnalytics);
router.get('/export', protect, analyticsController.exportAnalytics);
router.get('/date-range', protect, analyticsController.getDateRangeAnalytics);
router.delete('/clear', protect, analyticsController.clearAnalytics);

module.exports = router;
