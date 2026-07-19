const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  getDashboardStats,
  getUsers,
  getUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getSystemHealth,
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:userId', getUser);
router.put('/users/:userId/role', updateUserRole);
router.put('/users/:userId/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);
router.get('/health', getSystemHealth);

module.exports = router;
