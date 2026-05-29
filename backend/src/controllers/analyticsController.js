const ScrapeJob = require('../models/ScrapeJob');
const PDFJob = require('../models/PDFJob');
const Export = require('../models/Export');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const getOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [
    totalScrapeJobs,
    completedScrapeJobs,
    failedScrapeJobs,
    totalPdfJobs,
    completedPdfJobs,
    totalExports,
    scrapeByType,
    scrapeJobsToday,
    pdfJobsToday,
  ] = await Promise.all([
    ScrapeJob.countDocuments({ userId }),
    ScrapeJob.countDocuments({ userId, status: 'completed' }),
    ScrapeJob.countDocuments({ userId, status: 'failed' }),
    PDFJob.countDocuments({ userId }),
    PDFJob.countDocuments({ userId, status: 'completed' }),
    Export.countDocuments({ userId }),
    ScrapeJob.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$scrapingType', count: { $sum: 1 } } },
    ]),
    ScrapeJob.countDocuments({ userId, createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    PDFJob.countDocuments({ userId, createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
  ]);

  res.json({
    success: true,
    data: {
      totalJobs: totalScrapeJobs + totalPdfJobs,
      scrapeJobs: totalScrapeJobs,
      completedJobs: completedScrapeJobs + completedPdfJobs,
      failedJobs: failedScrapeJobs,
      totalExports,
      scrapeByType: Object.fromEntries(scrapeByType.map((t) => [t._id, t.count])),
      todayJobs: scrapeJobsToday + pdfJobsToday,
    },
  });
});

const getTrends = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const period = parseInt(req.query.period) || 30;
  const since = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

  const scrapeTrends = await ScrapeJob.aggregate([
    { $match: { userId, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const pdfTrends = await PDFJob.aggregate([
    { $match: { userId, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    data: { period, scrapeTrends, pdfTrends },
  });
});

const getFrequency = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const limit = parseInt(req.query.limit) || 10;

  const topUrls = await ScrapeJob.aggregate([
    { $match: { userId } },
    { $group: { _id: '$targetUrl', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  res.json({
    success: true,
    data: { topUrls },
  });
});

const getKeywords = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const limit = parseInt(req.query.limit) || 20;

  const jobs = await ScrapeJob.find(
    { userId, 'results.metadata.keywords': { $exists: true, $not: { $size: 0 } } },
    { 'results.metadata.keywords': 1 },
  ).limit(100).lean();

  const freq = {};
  for (const job of jobs) {
    for (const kw of (job.results?.metadata?.keywords || [])) {
      if (kw && typeof kw === 'string') {
        freq[kw.toLowerCase()] = (freq[kw.toLowerCase()] || 0) + 1;
      }
    }
  }

  const topKeywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([keyword, count]) => ({ keyword, count }));

  res.json({
    success: true,
    data: { keywords: topKeywords },
  });
});

const getJobAnalytics = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user._id;

  const job = await ScrapeJob.findOne({ _id: jobId, userId }).lean();
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  res.json({
    success: true,
    data: {
      jobId: job._id,
      status: job.status,
      targetUrl: job.targetUrl,
      scrapingType: job.scrapingType,
      duration: job.duration,
      fileSize: job.fileSize,
      downloadCount: job.downloadCount,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      error: job.error,
    },
  });
});

const exportAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { format = 'csv', dataType = 'overview' } = req.query;

  const overview = await getOverviewData(userId);

  let csv = 'Metric,Value\n';
  for (const [key, val] of Object.entries(overview)) {
    csv += `${key},${val}\n`;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=analytics-${dataType}.${format}`);
  res.send(csv);
});

const getDateRangeAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate } = req.query;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ success: false, message: 'Invalid date range' });
  }

  const jobs = await ScrapeJob.find({
    userId,
    createdAt: { $gte: start, $lte: end },
  }).sort({ createdAt: -1 }).lean();

  res.json({
    success: true,
    data: {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalJobs: jobs.length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
      jobs,
    },
  });
});

const clearAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Export.deleteMany({ userId });

  res.json({
    success: true,
    message: 'Analytics data cleared successfully',
  });
});

async function getOverviewData(userId) {
  const [totalScrape, totalPdf, totalExport] = await Promise.all([
    ScrapeJob.countDocuments({ userId }),
    PDFJob.countDocuments({ userId }),
    Export.countDocuments({ userId }),
  ]);
  return { totalScrapeJobs: totalScrape, totalPdfJobs: totalPdf, totalExports: totalExport };
}

module.exports = {
  getOverview,
  getTrends,
  getFrequency,
  getKeywords,
  getJobAnalytics,
  exportAnalytics,
  getDateRangeAnalytics,
  clearAnalytics,
};
