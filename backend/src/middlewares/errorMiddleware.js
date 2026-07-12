const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with request context
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id,
  });

  // Mongoose CastError
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const message = 'File size too large';
      error = { message, statusCode: 400 };
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      const message = 'Too many files';
      error = { message, statusCode: 400 };
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      const message = 'Unexpected file field';
      error = { message, statusCode: 400 };
    } else {
      const message = 'File upload error';
      error = { message, statusCode: 400 };
    }
  }

  // Puppeteer errors
  if (err.name === 'ProtocolError' || err.message?.includes('net::ERR_')) {
    const message = 'Failed to load webpage';
    error = { message, statusCode: 400 };
  }

  // PDF parsing errors
  if (err.message?.includes('PDF')) {
    const message = 'Failed to process PDF file';
    error = { message, statusCode: 400 };
  }

  // Network errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    const message = 'Network connection failed';
    error = { message, statusCode: 503 };
  }

  // Timeout errors
  if (err.code === 'ETIMEDOUT') {
    const message = 'Request timeout';
    error = { message, statusCode: 408 };
  }

  // File system errors
  if (err.code === 'ENOENT') {
    const message = 'File not found';
    error = { message, statusCode: 404 };
  }

  if (err.code === 'EACCES') {
    const message = 'Permission denied';
    error = { message, statusCode: 403 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : {
      stack: err.stack,
      details: err,
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};

const notFound = (req, res, next) => {
  if (req.originalUrl === '/favicon.ico') return res.status(204).end();
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
};
