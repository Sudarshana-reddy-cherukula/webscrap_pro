const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
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
} = require('../controllers/workflowController');

router.use(protect);

router.post('/', createWorkflow);
router.get('/', getWorkflows);
router.get('/stats', getStats);
router.get('/:id', getWorkflow);
router.put('/:id', updateWorkflow);
router.delete('/:id', deleteWorkflow);
router.post('/:id/toggle', toggleWorkflow);
router.post('/:id/execute', executeWorkflow);
router.get('/:id/runs', getRunHistory);
router.get('/runs/:runId', getRun);
router.post('/runs/:runId/cancel', cancelRun);

module.exports = router;
