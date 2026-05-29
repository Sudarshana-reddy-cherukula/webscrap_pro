require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const { httpLogger } = require('./middlewares/loggerMiddleware');
const { cleanupOldFiles } = require('./middlewares/uploadMiddleware');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(compression());

// General API rate limiter 
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health' || req.path === '/api';
  },
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/auth', authLimiter);
app.use('/api/pdf', uploadLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(httpLogger);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/scrape', require('./routes/scrapingRoutes'));
app.use('/api/pdf', require('./routes/pdfRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'WebScrap Pro Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      scraping: '/api/scrape',
      pdf: '/api/pdf',
      export: '/api/export',
      analytics: '/api/analytics',
      user: '/api/user',
      health: '/api/health',
      test: '/api/test',
    },
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: "Backend Connected Successfully"
  });
});

app.use(notFound);
app.use(errorHandler);

setInterval(() => {
  cleanupOldFiles('./src/uploads', 24 * 60 * 60 * 1000);
  cleanupOldFiles('./src/exports', 24 * 60 * 60 * 1000);
}, 60 * 60 * 1000);

module.exports = app;
