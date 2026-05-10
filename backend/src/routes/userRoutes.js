const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { validateQuery } = require('../middlewares/validationMiddleware');
const { paginationSchema } = require('../validations');

router.get('/dashboard', protect, userController.getDashboard);
router.get('/history', protect, validateQuery(paginationSchema), userController.getHistory);
router.get('/downloads', protect, validateQuery(paginationSchema), userController.getDownloads);
router.get('/statistics', protect, userController.getStatistics);

module.exports = router;
