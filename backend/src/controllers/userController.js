const User = require('../models/User');
const ScrapeJob = require('../models/ScrapeJob');
const PDFJob = require('../models/PDFJob');
const Export = require('../models/Export');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const [
    totalScrapingJobs,
    completedScrapingJobs,
    totalPDFJobs,
    completedPDFJobs,
    totalExports,
    recentJobs,
    userStats,
  ] = await Promise.all([
    ScrapeJob.countDocuments({ userId }),
    ScrapeJob.countDocuments({ userId, status: 'completed' }),
    PDFJob.countDocuments({ userId }),
    PDFJob.countDocuments({ userId, status: 'completed' }),
    Export.countDocuments({ userId }),
    ScrapeJob.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('targetUrl scrapingType status progress createdAt completedAt'),
    User.findById(userId).select('usage subscription createdAt'),
  ]);
  
  const successRate = {
    scraping: totalScrapingJobs > 0 ? Math.round((completedScrapingJobs / totalScrapingJobs) * 100) : 0,
    pdf: totalPDFJobs > 0 ? Math.round((completedPDFJobs / totalPDFJobs) * 100) : 0,
  };
  
  const dashboardData = {
    user: userStats,
    statistics: {
      scraping: {
        total: totalScrapingJobs,
        completed: completedScrapingJobs,
        successRate: successRate.scraping,
      },
      pdf: {
        total: totalPDFJobs,
        completed: completedPDFJobs,
        successRate: successRate.pdf,
      },
      exports: {
        total: totalExports,
      },
    },
    recentActivity: recentJobs.map(job => ({
      id: job._id,
      type: 'scraping',
      target: job.targetUrl,
      status: job.status,
      progress: job.progress,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    })),
  };
  
  res.json({
    success: true,
    message: 'Dashboard data retrieved successfully',
    data: dashboardData,
  });
});

const getHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { type, page = 1, limit = 10 } = req.query;
  
  const skip = (page - 1) * limit;
  let history = [];
  let total = 0;
  
  if (!type || type === 'scraping') {
    const scrapingJobs = await ScrapeJob.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('targetUrl scrapingType status progress createdAt completedAt duration fileSize downloadCount');
    
    history = history.concat(
      scrapingJobs.map(job => ({
        id: job._id,
        type: 'scraping',
        target: job.targetUrl,
        operation: job.scrapingType,
        status: job.status,
        progress: job.progress,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
        fileSize: job.fileSize,
        downloadCount: job.downloadCount,
      }))
    );
    
    total += await ScrapeJob.countDocuments({ userId });
  }
  
  if (!type || type === 'pdf') {
    const pdfJobs = await PDFJob.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('originalName operation status progress createdAt completedAt duration fileSize downloadCount');
    
    history = history.concat(
      pdfJobs.map(job => ({
        id: job._id,
        type: 'pdf',
        target: job.originalName,
        operation: job.operation,
        status: job.status,
        progress: job.progress,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
        fileSize: job.fileSize,
        downloadCount: job.downloadCount,
      }))
    );
    
    total += await PDFJob.countDocuments({ userId });
  }
  
  if (!type || type === 'export') {
    const exportJobs = await Export.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('sourceType sourceId exportType status createdAt completedAt duration fileSize downloadCount');
    
    history = history.concat(
      exportJobs.map(job => ({
        id: job._id,
        type: 'export',
        target: `${job.sourceType}:${job.sourceId}`,
        operation: job.exportType,
        status: job.status,
        progress: 100,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
        fileSize: job.fileSize,
        downloadCount: job.downloadCount,
      }))
    );
    
    total += await Export.countDocuments({ userId });
  }
  
  history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const paginatedHistory = history.slice(skip, skip + parseInt(limit));
  
  res.json({
    success: true,
    message: 'History retrieved successfully',
    data: {
      history: paginatedHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

const getDownloads = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  
  const skip = (page - 1) * limit;
  
  const [
    scrapingJobs,
    pdfJobs,
    exportJobs,
  ] = await Promise.all([
    ScrapeJob.find({ 
      userId, 
      status: 'completed',
      downloadCount: { $gt: 0 }
    })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('targetUrl scrapingType completedAt downloadCount fileSize'),
    
    PDFJob.find({ 
      userId, 
      status: 'completed',
      downloadCount: { $gt: 0 }
    })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('originalName operation completedAt downloadCount fileSize'),
    
    Export.find({ 
      userId, 
      status: 'completed',
      downloadCount: { $gt: 0 }
    })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('sourceType sourceId exportType completedAt downloadCount fileSize'),
  ]);
  
  const downloads = [
    ...scrapingJobs.map(job => ({
      id: job._id,
      type: 'scraping',
      name: job.targetUrl,
      operation: job.scrapingType,
      downloadedAt: job.completedAt,
      downloadCount: job.downloadCount,
      fileSize: job.fileSize,
    })),
    ...pdfJobs.map(job => ({
      id: job._id,
      type: 'pdf',
      name: job.originalName,
      operation: job.operation,
      downloadedAt: job.completedAt,
      downloadCount: job.downloadCount,
      fileSize: job.fileSize,
    })),
    ...exportJobs.map(job => ({
      id: job._id,
      type: 'export',
      name: `${job.sourceType} -> ${job.exportType}`,
      operation: job.exportType,
      downloadedAt: job.completedAt,
      downloadCount: job.downloadCount,
      fileSize: job.fileSize,
    })),
  ].sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));
  
  const total = await Promise.all([
    ScrapeJob.countDocuments({ userId, status: 'completed', downloadCount: { $gt: 0 } }),
    PDFJob.countDocuments({ userId, status: 'completed', downloadCount: { $gt: 0 } }),
    Export.countDocuments({ userId, status: 'completed', downloadCount: { $gt: 0 } }),
  ]).then(counts => counts.reduce((sum, count) => sum + count, 0));
  
  res.json({
    success: true,
    message: 'Downloads retrieved successfully',
    data: {
      downloads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

const getStatistics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { period = '30d' } = req.query;
  
  let startDate;
  const endDate = new Date();
  
  switch (period) {
    case '7d':
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  const [
    scrapingStats,
    pdfStats,
    exportStats,
    userUsage,
  ] = await Promise.all([
    ScrapeJob.aggregate([
      { $match: { userId: userId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    PDFJob.aggregate([
      { $match: { userId: userId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    Export.aggregate([
      { $match: { userId: userId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    User.findById(userId).select('usage subscription'),
  ]);
  
  const formatStats = (stats) => {
    const formatted = { total: 0, completed: 0, failed: 0, pending: 0 };
    stats.forEach(stat => {
      formatted.total += stat.count;
      formatted[stat._id] = stat.count;
    });
    return formatted;
  };
  
  const statistics = {
    period,
    scraping: formatStats(scrapingStats),
    pdf: formatStats(pdfStats),
    exports: formatStats(exportStats),
    usage: userUsage.usage,
    subscription: userUsage.subscription,
  };
  
  res.json({
    success: true,
    message: 'Statistics retrieved successfully',
    data: statistics,
  });
});

module.exports = {
  getDashboard,
  getHistory,
  getDownloads,
  getStatistics,
};
