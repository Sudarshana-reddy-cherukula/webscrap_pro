const { Worker } = require('bullmq');
const { getRedis } = require('../config/redis');
const { QUEUE_NAMES } = require('../config/queue');
const ScrapeJob = require('../models/ScrapeJob');
const scrapingService = require('../services/scrapingService');
const socketHandler = require('../sockets/socketHandler');
const logger = require('../utils/logger');

let worker = null;

function startScrapeWorker() {
  if (!getRedis()) {
    logger.warn('Redis not available — scrape worker disabled (sync mode active)');
    return null;
  }

  worker = new Worker(
    QUEUE_NAMES.SCRAPE,
    async (job) => {
      const { jobId, userId, url, options } = job.data;
      logger.info({ jobId, userId }, 'Scrape worker processing job');

      socketHandler.broadcastJobStarted(jobId, 'scrape', { targetUrl: url });

      try {
        const result = await scrapingService.scrapeUrl(userId, url, {
          ...options,
          onProgress: (progress) => {
            job.updateProgress(progress);
            socketHandler.broadcastJobProgress(jobId, 'scrape', progress);
          },
        });

        socketHandler.broadcastJobCompleted(jobId, 'scrape', result);
        return result;
      } catch (err) {
        socketHandler.broadcastJobFailed(jobId, 'scrape', err);
        throw err;
      }
    },
    {
      connection: getRedis(),
      concurrency: 5,
      limiter: { max: 10, duration: 60000 },
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.data.jobId }, 'Scrape job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.data?.jobId, err: err.message }, 'Scrape job failed');
  });

  logger.info('Scrape worker started (concurrency: 5)');
  return worker;
}

async function stopScrapeWorker() {
  if (worker) {
    await worker.close();
    worker = null;
  }
}

module.exports = { startScrapeWorker, stopScrapeWorker };
