require('dotenv').config();
const http = require('http');
const socketHandler = require('./src/sockets/socketHandler');
const { connectDB } = require('./src/config/database');
const logger = require('./src/utils/logger');
const app = require('./src/app');
const listEndpoints = require("express-list-endpoints");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

socketHandler.initialize(server);

const startServer = async () => {
  try {
    await connectDB();
    
    server.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      logger.info(`Socket.io server running on port ${PORT}`);
      logger.info(`API documentation available at http://localhost:${PORT}/api`);
      
      // Display all available endpoints
      console.log('\n📋 Available API Endpoints:');
      console.log(listEndpoints(app));
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

startServer();
