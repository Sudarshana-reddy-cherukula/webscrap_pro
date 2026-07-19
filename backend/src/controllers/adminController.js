const adminService = require('../services/adminService');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.json({ success: true, data: stats });
});

const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, plan, status } = req.query;
  const result = await adminService.getUsers({
    page: parseInt(page), limit: parseInt(limit), search, role, plan, status,
  });
  res.json({ success: true, data: result });
});

const getUser = asyncHandler(async (req, res) => {
  const result = await adminService.getUser(req.params.userId);
  res.json({ success: true, data: result });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role || !['user', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  const user = await adminService.updateUserRole(req.params.userId, role);
  res.json({ success: true, data: user });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await adminService.updateUserStatus(req.params.userId, isActive);
  res.json({ success: true, data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.userId);
  res.json({ success: true, message: 'User deleted' });
});

const getSystemHealth = asyncHandler(async (req, res) => {
  const health = await adminService.getSystemHealth();
  res.json({ success: true, data: health });
});

module.exports = {
  getDashboardStats,
  getUsers,
  getUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getSystemHealth,
};
