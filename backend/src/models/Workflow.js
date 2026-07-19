const mongoose = require('mongoose');

const workflowStepSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['scrape', 'transform', 'condition', 'export', 'webhook', 'delay'],
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  onError: {
    type: String,
    enum: ['stop', 'continue', 'retry'],
    default: 'stop',
  },
  retryCount: {
    type: Number,
    default: 3,
  },
}, { _id: true });

const workflowSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  steps: [workflowStepSchema],
  enabled: {
    type: Boolean,
    default: true,
  },
  trigger: {
    type: {
      type: String,
      enum: ['manual', 'cron', 'webhook'],
      default: 'manual',
    },
    cronExpression: String,
    webhookToken: String,
  },
  lastRun: {
    type: Date,
  },
  nextRun: {
    type: Date,
  },
  runCount: {
    type: Number,
    default: 0,
  },
  lastError: {
    type: String,
  },
  lastStatus: {
    type: String,
    enum: ['idle', 'running', 'success', 'failed'],
    default: 'idle',
  },
}, {
  timestamps: true,
});

workflowSchema.index({ userId: 1, enabled: 1 });
workflowSchema.index({ userId: 1, createdAt: -1 });

workflowSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.stepCount = this.steps?.length || 0;
  return obj;
};

module.exports = mongoose.model('Workflow', workflowSchema);
