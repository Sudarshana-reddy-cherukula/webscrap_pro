const scrapingService = require('../services/scrapingService');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const scrapeUrl = asyncHandler(async (req, res) => {
  const { url, options } = req.body;
  
  try {
    const { job, results } = await scrapingService.scrapeUrl(req.user._id, url, options);
    
    res.status(201).json({
      success: true,
      message: 'URL scraped successfully',
      data: {
        jobId: job._id,
        status: job.status,
        targetUrl: job.targetUrl,
        scrapingType: job.scrapingType,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to scrape URL',
      error: error.message,
    });
  }
});

const scrapeImages = asyncHandler(async (req, res) => {
  const { url, options } = req.body;
  
  try {
    const { job, results } = await scrapingService.scrapeImages(req.user._id, url, options);
    
    res.status(201).json({
      success: true,
      message: 'Images scraped successfully',
      data: {
        jobId: job._id,
        status: job.status,
        targetUrl: job.targetUrl,
        scrapingType: job.scrapingType,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to scrape images',
      error: error.message,
    });
  }
});

const scrapeLinks = asyncHandler(async (req, res) => {
  const { url, options } = req.body;
  
  try {
    const { job, results } = await scrapingService.scrapeLinks(req.user._id, url, options);
    
    res.status(201).json({
      success: true,
      message: 'Links scraped successfully',
      data: {
        jobId: job._id,
        status: job.status,
        targetUrl: job.targetUrl,
        scrapingType: job.scrapingType,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to scrape links',
      error: error.message,
    });
  }
});

const scrapeMetadata = asyncHandler(async (req, res) => {
  const { url, options } = req.body;
  
  try {
    const { job, results } = await scrapingService.scrapeMetadata(req.user._id, url, options);
    
    res.status(201).json({
      success: true,
      message: 'Metadata scraped successfully',
      data: {
        jobId: job._id,
        status: job.status,
        targetUrl: job.targetUrl,
        scrapingType: job.scrapingType,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to scrape metadata',
      error: error.message,
    });
  }
});

const getJobStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  try {
    const job = await scrapingService.getJobStatus(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Scraping job not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Job status retrieved successfully',
      data: {
        jobId: job._id,
        status: job.status,
        progress: job.progress,
        targetUrl: job.targetUrl,
        scrapingType: job.scrapingType,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        duration: job.duration,
        error: job.error,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to get job status',
      error: error.message,
    });
  }
});

const getJobResults = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  try {
    const results = await scrapingService.getJobResults(jobId);
    const job = await scrapingService.getJobStatus(jobId);
    
    res.json({
      success: true,
      message: 'Job results retrieved successfully',
      data: {
        jobId: job._id,
        status: job.status,
        results,
        fileSize: job.fileSize,
        downloadCount: job.downloadCount,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to get job results',
      error: error.message,
    });
  }
});

const pauseJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  try {
    await scrapingService.pauseJob(jobId);

    res.json({
      success: true,
      message: 'Scraping job paused successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to pause job',
      error: error.message,
    });
  }
});

const resumeJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  try {
    await scrapingService.resumeJob(jobId);

    res.json({
      success: true,
      message: 'Scraping job resumed successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to resume job',
      error: error.message,
    });
  }
});

const deleteJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  try {
    await scrapingService.deleteJob(jobId);
    
    res.json({
      success: true,
      message: 'Scraping job deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message,
    });
  }
});

const getUserJobs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  try {
    const result = await scrapingService.getUserJobs(req.user._id, page, limit);
    
    res.json({
      success: true,
      message: 'User scraping jobs retrieved successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to get user jobs',
      error: error.message,
    });
  }
});

module.exports = {
  scrapeUrl,
  scrapeImages,
  scrapeLinks,
  scrapeMetadata,
  getJobStatus,
  getJobResults,
  deleteJob,
  getUserJobs,
  pauseJob,
  resumeJob,
};
