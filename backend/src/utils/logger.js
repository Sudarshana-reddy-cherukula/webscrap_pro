const pino = require('pino');

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { service: 'webscrap-pro-backend' },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  transport: isDev
    ? {
        target: 'pino/file',
        options: { destination: 1, colorize: true },
      }
    : undefined,
});

module.exports = logger;
