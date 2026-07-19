const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/scrape', require('./scrapingRoutes'));
router.use('/pdf', require('./pdfRoutes'));
router.use('/export', require('./exportRoutes'));
router.use('/user', require('./userRoutes'));
router.use('/settings', require('./settingsRoutes'));
router.use('/analytics', require('./analyticsRoutes'));
router.use('/ai', require('../aiRoutes'));
router.use('/workflows', require('../workflowRoutes'));
router.use('/webhooks', require('../webhookRoutes'));
router.use('/admin', require('../adminRoutes'));

module.exports = router;
