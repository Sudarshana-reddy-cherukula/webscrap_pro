const ScrapeJob = require('../models/ScrapeJob');
const Embedding = require('../models/Embedding');
const ChatSession = require('../models/ChatSession');
const aiService = require('../services/aiService');
const duplicateService = require('../services/duplicateService');
const schedulerService = require('../services/schedulerService');
const reportService = require('../services/reportService');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const summarize = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { style, maxLength } = req.body;

  const job = await ScrapeJob.findOne({ _id: jobId, userId: req.user._id });
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  const text = job.results?.text;
  if (!text) {
    return res.status(400).json({ success: false, message: 'No text content available for summarization' });
  }

  const result = await aiService.summarize(text, { style, maxLength });

  res.json({ success: true, data: result });
});

const extractKeywords = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { maxKeywords } = req.body;

  const job = await ScrapeJob.findOne({ _id: jobId, userId: req.user._id });
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  const text = job.results?.text;
  if (!text) {
    return res.status(400).json({ success: false, message: 'No text content available for keyword extraction' });
  }

  const result = await aiService.extractKeywords(text, { maxKeywords });

  res.json({ success: true, data: result });
});

const classify = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { categories } = req.body;

  const job = await ScrapeJob.findOne({ _id: jobId, userId: req.user._id });
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  const text = job.results?.text;
  if (!text) {
    return res.status(400).json({ success: false, message: 'No text content available for classification' });
  }

  const result = await aiService.classify(text, { categories });

  res.json({ success: true, data: result });
});

const generateEmbedding = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await ScrapeJob.findOne({ _id: jobId, userId: req.user._id });
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  const text = job.results?.text;
  if (!text) {
    return res.status(400).json({ success: false, message: 'No text content available for embedding' });
  }

  const existing = await Embedding.findOne({ jobId, userId: req.user._id });
  if (existing) {
    return res.json({ success: true, data: { embeddingId: existing._id, message: 'Embedding already exists' } });
  }

  const result = await aiService.generateEmbedding(text);

  if (result.embedding) {
    const embeddingDoc = await Embedding.create({
      userId: req.user._id,
      jobId,
      content: text.slice(0, 5000),
      embedding: result.embedding,
      metadata: {
        url: job.targetUrl,
        title: job.results?.metadata?.title,
        keywords: job.results?.metadata?.keywords,
      },
      model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
      dimensions: result.embedding.length,
    });

    return res.json({ success: true, data: { embeddingId: embeddingDoc._id, dimensions: result.embedding.length } });
  }

  res.status(500).json({ success: false, message: 'Failed to generate embedding', error: result.error });
});

const semanticSearch = asyncHandler(async (req, res) => {
  const { query, limit = 10, threshold = 0.7 } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, message: 'Query is required' });
  }

  const result = await aiService.generateEmbedding(query);
  if (!result.embedding) {
    return res.status(500).json({ success: false, message: 'Failed to generate query embedding' });
  }

  const similar = await Embedding.findSimilar(req.user._id, result.embedding, { limit, threshold });

  res.json({ success: true, data: { results: similar, query } });
});

const detectDuplicate = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await ScrapeJob.findOne({ _id: jobId, userId: req.user._id });
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  const result = await duplicateService.detectDuplicate(jobId, req.user._id);

  res.json({ success: true, data: result });
});

const getDuplicateStats = asyncHandler(async (req, res) => {
  const result = await duplicateService.getDuplicateStats(req.user._id);
  res.json({ success: true, data: result });
});

const createChatSession = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await ScrapeJob.findOne({ _id: jobId, userId: req.user._id });
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  const session = await ChatSession.create({
    userId: req.user._id,
    jobId,
    title: `Chat about ${job.results?.metadata?.title || job.targetUrl}`,
  });

  res.json({ success: true, data: session });
});

const chat = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const session = await ChatSession.findOne({ _id: sessionId, userId: req.user._id });
  if (!session) {
    return res.status(404).json({ success: false, message: 'Chat session not found' });
  }

  const job = await ScrapeJob.findById(session.jobId);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Original scrape job not found' });
  }

  const context = job.results?.text || '';
  const messages = session.messages.map(m => ({ role: m.role, content: m.content }));
  messages.push({ role: 'user', content: message });

  const result = await aiService.chatWithContent(messages, context);

  session.messages.push({ role: 'user', content: message });
  session.messages.push({ role: 'assistant', content: result.response });
  await session.save();

  res.json({ success: true, data: { response: result.response, fallback: result.fallback } });
});

const getChatSessions = asyncHandler(async (req, res) => {
  const sessions = await ChatSession.find({ userId: req.user._id, isActive: true })
    .sort({ updatedAt: -1 })
    .populate('jobId', 'targetUrl results.metadata.title');

  res.json({ success: true, data: sessions });
});

const getChatHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await ChatSession.findOne({ _id: sessionId, userId: req.user._id });
  if (!session) {
    return res.status(404).json({ success: false, message: 'Chat session not found' });
  }

  res.json({ success: true, data: session });
});

const createScheduledJob = asyncHandler(async (req, res) => {
  const { name, url, cronExpression, options, enabled } = req.body;

  if (!name || !url || !cronExpression) {
    return res.status(400).json({ success: false, message: 'Name, URL, and cron expression are required' });
  }

  const cron = require('node-cron');
  if (!cron.validate(cronExpression)) {
    return res.status(400).json({ success: false, message: 'Invalid cron expression' });
  }

  const job = await schedulerService.createJob(req.user._id, {
    name,
    url,
    cronExpression,
    options: options || {},
    enabled: enabled !== false,
  });

  res.json({ success: true, data: job });
});

const getScheduledJobs = asyncHandler(async (req, res) => {
  const jobs = await schedulerService.getUserJobs(req.user._id);
  res.json({ success: true, data: jobs });
});

const updateScheduledJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await schedulerService.updateJob(jobId, req.user._id, req.body);
  res.json({ success: true, data: job });
});

const deleteScheduledJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  await schedulerService.deleteJob(jobId, req.user._id);
  res.json({ success: true, message: 'Scheduled job deleted' });
});

const toggleScheduledJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await schedulerService.toggleJob(jobId, req.user._id);
  res.json({ success: true, data: job });
});

const runScheduledJobNow = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  await schedulerService.runNow(jobId, req.user._id);
  res.json({ success: true, message: 'Job executed successfully' });
});

const generateReport = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { includeSummary, includeKeywords, includeMetadata } = req.body;

  const job = await ScrapeJob.findOne({ _id: jobId, userId: req.user._id });
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  const result = await reportService.generateReport(jobId, req.user._id, {
    includeSummary,
    includeKeywords,
    includeMetadata,
  });

  res.json({ success: true, data: result });
});

const downloadReport = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const path = require('path');
  const fs = require('fs');

  const reportsDir = path.join(__dirname, '..', 'reports');
  const files = fs.readdirSync(reportsDir).filter(f => f.startsWith(`report-${jobId}`));
  
  if (files.length === 0) {
    return res.status(404).json({ success: false, message: 'No report found. Generate one first.' });
  }

  const latestFile = files.sort().reverse()[0];
  const filePath = path.join(reportsDir, latestFile);
  
  res.download(filePath, latestFile);
});

module.exports = {
  summarize,
  extractKeywords,
  classify,
  generateEmbedding,
  semanticSearch,
  detectDuplicate,
  getDuplicateStats,
  createChatSession,
  chat,
  getChatSessions,
  getChatHistory,
  createScheduledJob,
  getScheduledJobs,
  updateScheduledJob,
  deleteScheduledJob,
  toggleScheduledJob,
  runScheduledJobNow,
  generateReport,
  downloadReport,
};
