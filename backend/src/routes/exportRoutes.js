const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { protect } = require('../middlewares/authMiddleware');
const { validateRequest, validateParams, validateQuery } = require('../middlewares/validationMiddleware');
const {
  exportSchema,
  exportStatusSchema,
  paginationSchema,
} = require('../validations');

router.post('/create', protect, validateRequest(exportSchema), exportController.createExport);
router.get('/status/:exportId', protect, validateParams(exportStatusSchema), exportController.getExportStatus);
router.get('/download/:exportId', protect, validateParams(exportStatusSchema), exportController.downloadExport);
router.delete('/delete/:exportId', protect, validateParams(exportStatusSchema), exportController.deleteExport);
router.get('/list', protect, validateQuery(paginationSchema), exportController.listExports);

module.exports = router;
