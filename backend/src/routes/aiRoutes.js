const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/summarize/:jobId', protect, aiController.summarize);
router.post('/keywords/:jobId', protect, aiController.extractKeywords);
router.post('/classify/:jobId', protect, aiController.classify);
router.post('/embed/:jobId', protect, aiController.generateEmbedding);
router.post('/search', protect, aiController.semanticSearch);
router.post('/duplicate/:jobId', protect, aiController.detectDuplicate);
router.get('/duplicates/stats', protect, aiController.getDuplicateStats);

router.post('/chat/:jobId', protect, aiController.createChatSession);
router.post('/chat/:sessionId/message', protect, aiController.chat);
router.get('/chat/sessions', protect, aiController.getChatSessions);
router.get('/chat/:sessionId', protect, aiController.getChatHistory);

router.post('/schedule', protect, aiController.createScheduledJob);
router.get('/schedule', protect, aiController.getScheduledJobs);
router.put('/schedule/:jobId', protect, aiController.updateScheduledJob);
router.delete('/schedule/:jobId', protect, aiController.deleteScheduledJob);
router.post('/schedule/:jobId/toggle', protect, aiController.toggleScheduledJob);
router.post('/schedule/:jobId/run', protect, aiController.runScheduledJobNow);

router.post('/report/:jobId', protect, aiController.generateReport);
router.get('/report/:jobId/download', protect, aiController.downloadReport);

module.exports = router;
