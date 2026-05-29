const exportService = require('../services/exportService');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const createExport = asyncHandler(async (req, res) => {
  const { sourceType, sourceId, exportType, options } = req.body;

  try {
    const { job, results } = await exportService.createExportJob(
      req.user._id,
      sourceType,
      sourceId,
      exportType,
      options
    );

    res.status(201).json({
      success: true,
      message: 'Export job created successfully',
      data: {
        exportId: job._id,
        sourceType: job.sourceType,
        sourceId: job.sourceId,
        exportType: job.exportType,
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
      message: 'Failed to create export',
      error: error.message,
    });
  }
});

const getExportStatus = asyncHandler(async (req, res) => {
  const { exportId } = req.params;

  try {
    const exportJob = await exportService.getExportStatus(exportId);

    if (!exportJob) {
      return res.status(404).json({
        success: false,
        message: 'Export not found',
      });
    }

    res.json({
      success: true,
      message: 'Export status retrieved successfully',
      data: {
        exportId: exportJob._id,
        sourceType: exportJob.sourceType,
        sourceId: exportJob.sourceId,
        exportType: exportJob.exportType,
        status: exportJob.status,
        progress: exportJob.progress,
        createdAt: exportJob.createdAt,
        startedAt: exportJob.startedAt,
        completedAt: exportJob.completedAt,
        duration: exportJob.duration,
        error: exportJob.error,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to get export status',
      error: error.message,
    });
  }
});

const downloadExport = asyncHandler(async (req, res) => {
  const { exportId } = req.params;

  try {
    const fileInfo = await exportService.downloadExportFile(exportId);

    res.download(fileInfo.filePath, fileInfo.fileName);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to download export',
      error: error.message,
    });
  }
});

const deleteExport = asyncHandler(async (req, res) => {
  const { exportId } = req.params;

  try {
    await exportService.deleteExport(exportId);

    res.json({
      success: true,
      message: 'Export deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete export',
      error: error.message,
    });
  }
});

const listExports = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const result = await exportService.getUserExports(req.user._id, page, limit);

    res.json({
      success: true,
      message: 'User exports retrieved successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to get user exports',
      error: error.message,
    });
  }
});

module.exports = {
  createExport,
  getExportStatus,
  downloadExport,
  deleteExport,
  listExports,
};
