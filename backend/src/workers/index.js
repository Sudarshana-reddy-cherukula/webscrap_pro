const logger = require('../utils/logger');

function startWorkers() {
  logger.info('Workers disabled — running in sync mode (no Redis)');
}

async function stopWorkers() {
  // no-op: workers not started
}

module.exports = { startWorkers, stopWorkers };
