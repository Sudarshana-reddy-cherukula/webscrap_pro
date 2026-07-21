require('dotenv').config();

// Override DNS servers for Windows compatibility with MongoDB Atlas SRV resolution
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Validate environment variables at startup
const { validateEnv } = require('./src/config/env');
validateEnv();

const http = require('http');
const socketHandler = require('./src/sockets/socketHandler');
const { connectDB, disconnectDB } = require('./src/config/database');
const { startWorkers, stopWorkers } = require('./src/workers');
const logger = require('./src/utils/logger');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

socketHandler.initialize(server);

let isShuttingDown = false;

const startServer = async () => {
  try {
    await connectDB();
    startWorkers();

    server.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`Socket.io server running on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received. Starting graceful shutdown...`);

  const timeout = setTimeout(() => {
    logger.error('Shutdown timed out after 15s, forcing exit');
    process.exit(1);
  }, 15000);

  try {
    server.close(() => {
      logger.info('HTTP server closed');
    });

    if (socketHandler.io) {
      socketHandler.io.close(() => {
        logger.info('Socket.io server closed');
      });
    }

    await stopWorkers();
    logger.info('Workers stopped');

    await disconnectDB();
    logger.info('MongoDB disconnected');

    clearTimeout(timeout);
    logger.info('Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled Rejection');
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception');
  gracefulShutdown('uncaughtException');
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
