
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

class SocketHandler {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  initialize(server) {
    const socketAllowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://webscrap-pro-ecru.vercel.app',
    ];
    if (process.env.FRONTEND_URL) {
      process.env.FRONTEND_URL.split(',').map(s => s.trim()).forEach(url => {
        if (url && !socketAllowedOrigins.includes(url)) socketAllowedOrigins.push(url);
      });
    }

    this.io = new Server(server, {
      cors: {
        origin: (origin, cb) => {
          if (!origin || process.env.NODE_ENV === 'development' || socketAllowedOrigins.includes(origin)) cb(null, true);
          else cb(new Error(`Origin ${origin} not allowed by Socket.IO`));
        },
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    logger.info('Socket.io server initialized');
  }

  handleConnection(socket) {
    const userId = socket.user._id.toString();
    
    this.connectedUsers.set(userId, socket.id);
    logger.info(`User ${userId} connected`);

    socket.join(`user_${userId}`);

    socket.on('subscribe-job', (data) => {
      this.handleJobSubscription(socket, data);
    });

    socket.on('unsubscribe-job', (data) => {
      this.handleJobUnsubscription(socket, data);
    });

    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    socket.emit('connected', {
      message: 'Connected to real-time updates',
      userId,
    });
  }

  handleJobSubscription(socket, data) {
    const { jobId, jobType } = data;
    const userId = socket.user._id.toString();
    
    socket.join(`job_${jobId}`);
    socket.join(`user_${userId}_${jobType}`);
    
    logger.info(`User ${userId} subscribed to job ${jobId}`);
    
    socket.emit('subscribed', {
      jobId,
      jobType,
      message: 'Subscribed to job updates',
    });
  }

  handleJobUnsubscription(socket, data) {
    const { jobId, jobType } = data;
    const userId = socket.user._id.toString();
    
    socket.leave(`job_${jobId}`);
    socket.leave(`user_${userId}_${jobType}`);
    
    logger.info(`User ${userId} unsubscribed from job ${jobId}`);
    
    socket.emit('unsubscribed', {
      jobId,
      jobType,
      message: 'Unsubscribed from job updates',
    });
  }

  handleDisconnection(socket) {
    const userId = socket.user._id.toString();
    this.connectedUsers.delete(userId);
    logger.info(`User ${userId} disconnected`);
  }

  broadcastJobUpdate(jobId, jobType, update) {
    if (!this.io) return;

    this.io.to(`job_${jobId}`).emit('job-update', {
      jobId,
      jobType,
      ...update,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Broadcasted update for job ${jobId} of type ${jobType}`);
  }

  broadcastJobProgress(jobId, jobType, progress, message = '') {
    this.broadcastJobUpdate(jobId, jobType, {
      type: 'progress',
      progress,
      message,
    });
  }

  broadcastJobStarted(jobId, jobType, jobData) {
    this.broadcastJobUpdate(jobId, jobType, {
      type: 'started',
      status: 'processing',
      startedAt: new Date().toISOString(),
      ...jobData,
    });
  }

  broadcastJobCompleted(jobId, jobType, results) {
    this.broadcastJobUpdate(jobId, jobType, {
      type: 'completed',
      status: 'completed',
      completedAt: new Date().toISOString(),
      results,
    });
  }

  broadcastJobFailed(jobId, jobType, error) {
    this.broadcastJobUpdate(jobId, jobType, {
      type: 'failed',
      status: 'failed',
      completedAt: new Date().toISOString(),
      error: {
        message: error.message,
        code: error.code || 'JOB_ERROR',
      },
    });
  }

  broadcastJobCancelled(jobId, jobType) {
    this.broadcastJobUpdate(jobId, jobType, {
      type: 'cancelled',
      status: 'cancelled',
      completedAt: new Date().toISOString(),
    });
  }

  broadcastUserNotification(userId, notification) {
    if (!this.io) return;

    this.io.to(`user_${userId}`).emit('notification', {
      id: Date.now().toString(),
      ...notification,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Sent notification to user ${userId}`);
  }

  broadcastUserStatsUpdate(userId, stats) {
    if (!this.io) return;

    this.io.to(`user_${userId}`).emit('stats-update', {
      userId,
      stats,
      timestamp: new Date().toISOString(),
    });
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  isUserConnected(userId) {
    return this.connectedUsers.has(userId.toString());
  }

  getUserSocketId(userId) {
    return this.connectedUsers.get(userId.toString());
  }

  sendDirectMessage(userId, event, data) {
    if (!this.io) return;

    const socketId = this.getUserSocketId(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

module.exports = new SocketHandler();
