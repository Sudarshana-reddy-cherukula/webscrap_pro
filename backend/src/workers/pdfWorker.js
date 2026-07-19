const { Worker } = require('bullmq');
const { getRedis } = require('../config/redis');
const { QUEUE_NAMES } = require('../config/queue');
const pdfService = require('../services/pdfService');
const socketHandler = require('../sockets/socketHandler');
const logger = require('../utils/logger');

let worker = null;

function startPdfWorker() {
  if (!getRedis()) {
    logger.warn('Redis not available — PDF worker disabled (sync mode active)');
    return null;
  }

  worker = new Worker(
    QUEUE_NAMES.PDF,
    async (job) => {
      const { jobId, userId, operation, filePath, options } = job.data;
      logger.info({ jobId, userId, operation }, 'PDF worker processing job');

      socketHandler.broadcastJobStarted(jobId, 'pdf', { operation });

      try {
        let result;
        switch (operation) {
          case 'extractText':
            result = await pdfService.extractText(userId, { path: filePath }, options);
            break;
          case 'extractImages':
            result = await pdfService.extractImages(userId, { path: filePath }, options);
            break;
          case 'convertToDocx':
            result = await pdfService.convertToDocx(userId, { path: filePath }, options);
            break;
          default:
            throw new Error(`Unknown PDF operation: ${operation}`);
        }

        socketHandler.broadcastJobCompleted(jobId, 'pdf', result);
        return result;
      } catch (err) {
        socketHandler.broadcastJobFailed(jobId, 'pdf', err);
        throw err;
      }
    },
    {
      connection: getRedis(),
      concurrency: 3,
      limiter: { max: 5, duration: 60000 },
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.data.jobId }, 'PDF job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.data?.jobId, err: err.message }, 'PDF job failed');
  });

  logger.info('PDF worker started (concurrency: 3)');
  return worker;
}

async function stopPdfWorker() {
  if (worker) {
    await worker.close();
    worker = null;
  }
}

module.exports = { startPdfWorker, stopPdfWorker };
