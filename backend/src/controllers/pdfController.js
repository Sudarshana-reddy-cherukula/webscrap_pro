const pdfService = require('../services/pdfService');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const extractText = asyncHandler(async (req, res) => {
  const { options } = req.body;
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No PDF file uploaded',
    });
  }
  
  try {
    const { job, results } = await pdfService.extractText(req.file, options);
    
    res.status(201).json({
      success: true,
      message: 'Text extracted successfully',
      data: {
        jobId: job._id,
        filename: job.filename,
        originalName: job.originalName,
        operation: job.operation,
        status: job.status,
        fileSize: job.fileSize,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to extract text',
      error: error.message,
    });
  }
});

const extractImages = asyncHandler(async (req, res) => {
  const { options } = req.body;
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No PDF file uploaded',
    });
  }
  
  try {
    const { job, results } = await pdfService.extractImages(req.file, options);
    
    res.status(201).json({
      success: true,
      message: 'Images extracted successfully',
      data: {
        jobId: job._id,
        filename: job.filename,
        originalName: job.originalName,
        operation: job.operation,
        status: job.status,
        fileSize: job.fileSize,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to extract images',
      error: error.message,
    });
  }
});

const extractMetadata = asyncHandler(async (req, res) => {
  const { options } = req.body;
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No PDF file uploaded',
    });
  }
  
  try {
    const { job, results } = await pdfService.extractMetadata(req.file, options);
    
    res.status(201).json({
      success: true,
      message: 'Metadata extracted successfully',
      data: {
        jobId: job._id,
        filename: job.filename,
        originalName: job.originalName,
        operation: job.operation,
        status: job.status,
        fileSize: job.fileSize,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to extract metadata',
      error: error.message,
    });
  }
});

const convertToDocx = asyncHandler(async (req, res) => {
  const { options } = req.body;
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No PDF file uploaded',
    });
  }
  
  try {
    const { job, results } = await pdfService.convertToDocx(req.file, options);
    
    res.status(201).json({
      success: true,
      message: 'PDF converted to DOCX successfully',
      data: {
        jobId: job._id,
        filename: job.filename,
        originalName: job.originalName,
        operation: job.operation,
        status: job.status,
        fileSize: job.fileSize,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to convert to DOCX',
      error: error.message,
    });
  }
});

const convertToTxt = asyncHandler(async (req, res) => {
  const { options } = req.body;
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No PDF file uploaded',
    });
  }
  
  try {
    const { job, results } = await pdfService.convertToTxt(req.file, options);
    
    res.status(201).json({
      success: true,
      message: 'PDF converted to TXT successfully',
      data: {
        jobId: job._id,
        filename: job.filename,
        originalName: job.originalName,
        operation: job.operation,
        status: job.status,
        fileSize: job.fileSize,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to convert to TXT',
      error: error.message,
    });
  }
});

const getJobStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  try {
    const job = await pdfService.getJobStatus(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'PDF job not found',
      });
    }
    
    res.json({
      success: true,
      message: 'PDF job status retrieved successfully',
      data: {
        jobId: job._id,
        filename: job.filename,
        originalName: job.originalName,
        operation: job.operation,
        status: job.status,
        progress: job.progress,
        fileSize: job.fileSize,
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
    const results = await pdfService.getJobResults(jobId);
    const job = await pdfService.getJobStatus(jobId);
    
    res.json({
      success: true,
      message: 'PDF job results retrieved successfully',
      data: {
        jobId: job._id,
        operation: job.operation,
        results,
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

const deleteJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  try {
    await pdfService.deleteJob(jobId);
    
    res.json({
      success: true,
      message: 'PDF job deleted successfully',
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
    const result = await pdfService.getUserJobs(req.user._id, page, limit);
    
    res.json({
      success: true,
      message: 'User PDF jobs retrieved successfully',
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

const downloadProcessedFile = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  try {
    const fileInfo = await pdfService.downloadProcessedFile(jobId);
    
    res.download(fileInfo.filePath, fileInfo.fileName);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to download file',
      error: error.message,
    });
  }
});

module.exports = {
  extractText,
  extractImages,
  extractMetadata,
  convertToDocx,
  convertToTxt,
  getJobStatus,
  getJobResults,
  deleteJob,
  getUserJobs,
  downloadProcessedFile,
};
