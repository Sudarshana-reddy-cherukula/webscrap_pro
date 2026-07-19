const mongoose = require('mongoose');
const cron = require('node-cron');
const logger = require('../utils/logger');

const scheduledJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
  },
  cronExpression: {
    type: String,
    required: true,
  },
  options: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  lastRun: {
    type: Date,
  },
  nextRun: {
    type: Date,
  },
  runCount: {
    type: Number,
    default: 0,
  },
  lastError: {
    type: String,
  },
}, {
  timestamps: true,
});

scheduledJobSchema.index({ userId: 1, enabled: 1 });
scheduledJobSchema.index({ enabled: 1, nextRun: 1 });

const ScheduledJob = mongoose.model('ScheduledJob', scheduledJobSchema);

class SchedulerService {
  constructor() {
    this.activeJobs = new Map();
    this.scrapingService = null;
  }

  setScrapingService(service) {
    this.scrapingService = service;
  }

  async initialize() {
    try {
      const enabledJobs = await ScheduledJob.find({ enabled: true });
      for (const job of enabledJobs) {
        this.scheduleJob(job);
      }
      logger.info(`Scheduler initialized with ${enabledJobs.length} active jobs`);
    } catch (error) {
      logger.error('Scheduler initialization failed:', error.message);
    }
  }

  scheduleJob(job) {
    if (this.activeJobs.has(job._id.toString())) {
      this.unscheduleJob(job._id.toString());
    }

    if (!cron.validate(job.cronExpression)) {
      logger.error(`Invalid cron expression for job ${job._id}: ${job.cronExpression}`);
      return false;
    }

    const task = cron.schedule(job.cronExpression, async () => {
      await this.executeJob(job._id.toString());
    }, {
      timezone: 'UTC',
    });

    this.activeJobs.set(job._id.toString(), task);
    logger.info(`Scheduled job ${job._id} with cron: ${job.cronExpression}`);
    return true;
  }

  unscheduleJob(jobId) {
    const task = this.activeJobs.get(jobId);
    if (task) {
      task.stop();
      this.activeJobs.delete(jobId);
      logger.info(`Unscheduled job ${jobId}`);
      return true;
    }
    return false;
  }

  async executeJob(jobId) {
    try {
      const job = await ScheduledJob.findById(jobId);
      if (!job || !job.enabled) {
        return;
      }

      logger.info(`Executing scheduled job: ${job.name} (${job._id})`);

      if (this.scrapingService) {
        await this.scrapingService.scrapeUrl(job.userId, job.url, job.options);
      }

      job.lastRun = new Date();
      job.runCount += 1;
      job.lastError = null;
      await job.save();

      logger.info(`Scheduled job completed: ${job.name}`);
    } catch (error) {
      logger.error(`Scheduled job failed: ${jobId}`, error.message);
      
      const job = await ScheduledJob.findById(jobId);
      if (job) {
        job.lastError = error.message;
        await job.save();
      }
    }
  }

  async createJob(userId, data) {
    const job = await ScheduledJob.create({
      userId,
      ...data,
      enabled: data.enabled !== false,
    });

    if (job.enabled) {
      this.scheduleJob(job);
    }

    return job;
  }

  async updateJob(jobId, userId, updates) {
    const job = await ScheduledJob.findOne({ _id: jobId, userId });
    if (!job) {
      throw new Error('Job not found');
    }

    Object.assign(job, updates);
    await job.save();

    if (job.enabled) {
      this.scheduleJob(job);
    } else {
      this.unscheduleJob(jobId.toString());
    }

    return job;
  }

  async deleteJob(jobId, userId) {
    const job = await ScheduledJob.findOne({ _id: jobId, userId });
    if (!job) {
      throw new Error('Job not found');
    }

    this.unscheduleJob(jobId.toString());
    await ScheduledJob.findByIdAndDelete(jobId);
    return { message: 'Scheduled job deleted' };
  }

  async getUserJobs(userId) {
    return ScheduledJob.find({ userId }).sort({ createdAt: -1 });
  }

  async toggleJob(jobId, userId) {
    const job = await ScheduledJob.findOne({ _id: jobId, userId });
    if (!job) {
      throw new Error('Job not found');
    }

    job.enabled = !job.enabled;
    await job.save();

    if (job.enabled) {
      this.scheduleJob(job);
    } else {
      this.unscheduleJob(jobId.toString());
    }

    return job;
  }

  async runNow(jobId, userId) {
    const job = await ScheduledJob.findOne({ _id: jobId, userId });
    if (!job) {
      throw new Error('Job not found');
    }

    await this.executeJob(jobId.toString());
    return { message: 'Job executed successfully' };
  }

  shutdown() {
    for (const [jobId, task] of this.activeJobs) {
      task.stop();
    }
    this.activeJobs.clear();
    logger.info('Scheduler shut down');
  }
}

module.exports = new SchedulerService();
module.exports.ScheduledJob = ScheduledJob;
