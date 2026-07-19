const pinoHttp = require('pino-http');
const logger = require('../utils/logger');

const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/api/health' || req.url === '/health',
  },
  customProps: (req) => ({
    correlationId: req.correlationId,
  }),
});

module.exports = { httpLogger };
