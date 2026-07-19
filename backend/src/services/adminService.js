const User = require('../models/User');
const ScrapeJob = require('../models/ScrapeJob');
const PDFJob = require('../models/PDFJob');
const Export = require('../models/Export');
const Embedding = require('../models/Embedding');
const ChatSession = require('../models/ChatSession');
const Workflow = require('../models/Workflow');
const WorkflowRun = require('../models/WorkflowRun');
const Webhook = require('../models/Webhook');
const ApiKey = require('../models/ApiKey');
const mongoose = require('mongoose');

class AdminService {
  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsers30d,
      newUsers7d,
      totalScrapeJobs,
      totalPdfJobs,
      totalExports,
      totalWorkflows,
      totalWebhooks,
      totalApiKeys,
      scrapeJobs30d,
      pdfJobs30d,
      activeUsers,
      usersByPlan,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      ScrapeJob.countDocuments(),
      PDFJob.countDocuments(),
      Export.countDocuments(),
      Workflow.countDocuments(),
      Webhook.countDocuments(),
      ApiKey.countDocuments(),
      ScrapeJob.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      PDFJob.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ lastLogin: { $gte: sevenDaysAgo } }),
      User.aggregate([{ $group: { _id: '$subscription.plan', count: { $sum: 1 } } }]),
      User.find().sort({ createdAt: -1 }).limit(10).select('name email role subscription createdAt lastLogin isActive'),
    ]);

    const planStats = {};
    usersByPlan.forEach(p => { planStats[p._id || 'free'] = p.count; });

    const dailyUsers = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const dailyJobs = await ScrapeJob.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    return {
      overview: {
        totalUsers,
        newUsers30d,
        newUsers7d,
        activeUsers,
        totalScrapeJobs,
        totalPdfJobs,
        totalExports,
        totalWorkflows,
        totalWebhooks,
        totalApiKeys,
        scrapeJobs30d,
        pdfJobs30d,
      },
      planStats,
      dailyUsers,
      dailyJobs,
      recentUsers,
    };
  }

  async getUsers({ page = 1, limit = 20, search, role, plan, status } = {}) {
    const skip = (page - 1) * limit;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (plan) query['subscription.plan'] = plan;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password -twoFactorSecret -backupCodes'),
      User.countDocuments(query),
    ]);

    return { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getUser(userId) {
    const user = await User.findById(userId).select('-password -twoFactorSecret -backupCodes');
    if (!user) throw new Error('User not found');

    const [scrapeJobs, pdfJobs, exports, workflows] = await Promise.all([
      ScrapeJob.countDocuments({ userId }),
      PDFJob.countDocuments({ userId }),
      Export.countDocuments({ userId }),
      Workflow.countDocuments({ userId }),
    ]);

    return { user, stats: { scrapeJobs, pdfJobs, exports, workflows } };
  }

  async updateUserRole(userId, role) {
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateUserStatus(userId, isActive) {
    const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new Error('User not found');
    await Promise.all([
      ScrapeJob.deleteMany({ userId }),
      PDFJob.deleteMany({ userId }),
      Export.deleteMany({ userId }),
      Workflow.deleteMany({ userId }),
      Webhook.deleteMany({ userId }),
    ]);
    return { message: 'User and all associated data deleted' };
  }

  async getSystemHealth() {
    const dbState = mongoose.connection.readyState;
    const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

    return {
      database: {
        status: dbStates[dbState] || 'unknown',
        readyState: dbState,
      },
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      cpuUsage: process.cpuUsage(),
    };
  }
}

module.exports = new AdminService();
