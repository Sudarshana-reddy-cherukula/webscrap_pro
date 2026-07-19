const workflowService = require('../services/workflowService');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const createWorkflow = asyncHandler(async (req, res) => {
  const { name, description, steps, trigger } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  const workflow = await workflowService.createWorkflow(req.user._id, {
    name, description, steps, trigger,
  });
  res.status(201).json({ success: true, data: workflow });
});

const getWorkflows = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await workflowService.getWorkflows(req.user._id, {
    page: parseInt(page), limit: parseInt(limit),
  });
  res.json({ success: true, data: result });
});

const getWorkflow = asyncHandler(async (req, res) => {
  const workflow = await workflowService.getWorkflow(req.params.id, req.user._id);
  res.json({ success: true, data: workflow });
});

const updateWorkflow = asyncHandler(async (req, res) => {
  const workflow = await workflowService.updateWorkflow(req.params.id, req.user._id, req.body);
  res.json({ success: true, data: workflow });
});

const deleteWorkflow = asyncHandler(async (req, res) => {
  await workflowService.deleteWorkflow(req.params.id, req.user._id);
  res.json({ success: true, message: 'Workflow deleted' });
});

const toggleWorkflow = asyncHandler(async (req, res) => {
  const workflow = await workflowService.toggleWorkflow(req.params.id, req.user._id);
  res.json({ success: true, data: workflow });
});

const executeWorkflow = asyncHandler(async (req, res) => {
  const run = await workflowService.executeWorkflow(req.params.id, req.user._id, 'manual');
  res.json({ success: true, data: run });
});

const getRunHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await workflowService.getRunHistory(req.params.id, req.user._id, {
    page: parseInt(page), limit: parseInt(limit),
  });
  res.json({ success: true, data: result });
});

const getRun = asyncHandler(async (req, res) => {
  const run = await workflowService.getRun(req.params.runId, req.user._id);
  res.json({ success: true, data: run });
});

const cancelRun = asyncHandler(async (req, res) => {
  const run = await workflowService.cancelRun(req.params.runId, req.user._id);
  res.json({ success: true, data: run });
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await workflowService.getStats(req.user._id);
  res.json({ success: true, data: stats });
});

module.exports = {
  createWorkflow,
  getWorkflows,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  toggleWorkflow,
  executeWorkflow,
  getRunHistory,
  getRun,
  cancelRun,
  getStats,
};
