const Sentry = require('@sentry/node');
const logger = require('../utils/logger');

function initSentry(app) {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    logger.warn('SENTRY_DSN not set — Sentry disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      Sentry.expressIntegration({ app }),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers.authorization;
      }
      return event;
    },
  });

  logger.info('Sentry initialized');
}

function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      return error.status >= 500 || !error.status;
    },
  });
}

module.exports = { initSentry, sentryErrorHandler, Sentry };
