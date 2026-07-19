const { Queue } = require('bullmq');
const { getRedis, isRedisAvailable } = require('../config/redis');
const logger = require('../utils/logger');

const QUEUE_NAMES = {
  SCRAPE: 'scrape-jobs',
  PDF: 'pdf-jobs',
};

function createQueue(name) {
  if (!isRedisAvailable()) {
    logger.warn(`Redis not available — queue "${name}" disabled`);
    return null;
  }

  const queue = new Queue(name, {
    connection: getRedis(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { count: 100, age: 86400 },
      removeOnFail: { count: 50, age: 604800 },
    },
  });

  queue.on('error', (err) => {
    logger.error({ err: err.message, queue: name }, 'Queue error');
  });

  return queue;
}

let scrapeQueue = null;
let pdfQueue = null;

function getScrapeQueue() {
  if (!scrapeQueue) scrapeQueue = createQueue(QUEUE_NAMES.SCRAPE);
  return scrapeQueue;
}

function getPdfQueue() {
  if (!pdfQueue) pdfQueue = createQueue(QUEUE_NAMES.PDF);
  return pdfQueue;
}

async function closeQueues() {
  const queues = [scrapeQueue, pdfQueue].filter(Boolean);
  await Promise.allSettled(queues.map((q) => q.close()));
  scrapeQueue = null;
  pdfQueue = null;
}

module.exports = {
  QUEUE_NAMES,
  getScrapeQueue,
  getPdfQueue,
  closeQueues,
};
