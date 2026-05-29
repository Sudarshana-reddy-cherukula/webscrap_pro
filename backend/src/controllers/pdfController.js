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
    const { job, results } = await pdfService.extractText(req.user._id, req.file, options);
    
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
    const { job, results } = await pdfService.extractImages(req.user._id, req.file, options);
    
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
    const { job, results } = await pdfService.extractMetadata(req.user._id, req.file, options);
    
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
    const { job, results } = await pdfService.convertToDocx(req.user._id, req.file, options);
    
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
    const { job, results } = await pdfService.convertToTxt(req.user._id, req.file, options);
    
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

const modifyText = asyncHandler(async (req, res) => {
  const { operation, searchText, replaceText, targetPages } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No PDF file uploaded',
    });
  }

  try {
    const { job, results } = await pdfService.modifyText(
      req.user._id, req.file, { operation, searchText, replaceText, targetPages }
    );

    res.status(201).json({
      success: true,
      message: 'PDF text modified successfully',
      data: {
        jobId: job._id,
        filename: job.filename,
        originalName: job.originalName,
        operation: job.operation,
        status: job.status,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to modify text',
      error: error.message,
    });
  }
});

const addWatermark = asyncHandler(async (req, res) => {
  const { watermarkText, opacity, rotation, fontSize, color, position } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No PDF file uploaded',
    });
  }

  try {
    const { job, results } = await pdfService.addWatermark(
      req.user._id, req.file, { watermarkText, opacity, rotation, fontSize, color, position }
    );

    res.status(201).json({
      success: true,
      message: 'Watermark added successfully',
      data: {
        jobId: job._id,
        filename: job.filename,
        originalName: job.originalName,
        operation: job.operation,
        status: job.status,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to add watermark',
      error: error.message,
    });
  }
});

const addSecurity = asyncHandler(async (req, res) => {
  const { password, permissions } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No PDF file uploaded',
    });
  }

  try {
    const { job, results } = await pdfService.addSecurity(
      req.user._id, req.file, { password, permissions }
    );

    res.status(201).json({
      success: true,
      message: 'Security added successfully',
      data: {
        jobId: job._id,
        filename: job.filename,
        originalName: job.originalName,
        operation: job.operation,
        status: job.status,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to add security',
      error: error.message,
    });
  }
});

const splitPdf = asyncHandler(async (req, res) => {
  const { mode, pages } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No PDF file uploaded',
    });
  }

  try {
    const { job, results } = await pdfService.splitPdf(
      req.user._id, req.file, { mode, pages }
    );

    res.status(201).json({
      success: true,
      message: 'PDF split successfully',
      data: {
        jobId: job._id,
        filename: job.filename,
        originalName: job.originalName,
        operation: job.operation,
        status: job.status,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to split PDF',
      error: error.message,
    });
  }
});

const mergePdf = asyncHandler(async (req, res) => {
  const { fileOrder } = req.body;

  if (!req.files || req.files.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'At least two PDF files are required for merging',
    });
  }

  try {
    const { job, results } = await pdfService.mergePdf(
      req.user._id, req.files, { fileOrder }
    );

    res.status(201).json({
      success: true,
      message: 'PDFs merged successfully',
      data: {
        jobId: job._id,
        operation: job.operation,
        status: job.status,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to merge PDFs',
      error: error.message,
    });
  }
});

const rotatePages = asyncHandler(async (req, res) => {
  const { rotation, pages } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No PDF file uploaded',
    });
  }

  try {
    const { job, results } = await pdfService.rotatePages(
      req.user._id, req.file, { rotation, pages }
    );

    res.status(201).json({
      success: true,
      message: 'Pages rotated successfully',
      data: {
        jobId: job._id,
        filename: job.filename,
        originalName: job.originalName,
        operation: job.operation,
        status: job.status,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to rotate pages',
      error: error.message,
    });
  }
});

const cropPages = asyncHandler(async (req, res) => {
  const { top, right, bottom, left, unit, pages } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No PDF file uploaded',
    });
  }

  try {
    const { job, results } = await pdfService.cropPages(
      req.user._id, req.file, { top, right, bottom, left, unit, pages }
    );

    res.status(201).json({
      success: true,
      message: 'Pages cropped successfully',
      data: {
        jobId: job._id,
        filename: job.filename,
        originalName: job.originalName,
        operation: job.operation,
        status: job.status,
        results,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        duration: job.duration,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to crop pages',
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
  modifyText,
  addWatermark,
  addSecurity,
  splitPdf,
  mergePdf,
  rotatePages,
  cropPages,
  getJobStatus,
  getJobResults,
  deleteJob,
  getUserJobs,
  downloadProcessedFile,
};
