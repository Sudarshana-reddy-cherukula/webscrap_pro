const mongoose = require('mongoose');

const workflowRunSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
  },
  status: {
    type: String,
    enum: ['running', 'success', 'failed', 'cancelled'],
    default: 'running',
  },
  stepsRun: [{
    stepId: mongoose.Schema.Types.ObjectId,
    stepName: String,
    stepType: String,
    status: {
      type: String,
      enum: ['pending', 'running', 'success', 'failed', 'skipped'],
      default: 'pending',
    },
    input: mongoose.Schema.Types.Mixed,
    output: mongoose.Schema.Types.Mixed,
    error: String,
    startedAt: Date,
    completedAt: Date,
    duration: Number,
  }],
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
  duration: Number,
  triggerType: {
    type: String,
    enum: ['manual', 'cron', 'webhook'],
    default: 'manual',
  },
  error: String,
}, {
  timestamps: true,
});

workflowRunSchema.index({ workflowId: 1, createdAt: -1 });
workflowRunSchema.index({ userId: 1, createdAt: -1 });

workflowRunSchema.pre('save', function (next) {
  if (this.completedAt && this.startedAt) {
    this.duration = this.completedAt - this.startedAt;
  }
  next();
});

module.exports = mongoose.model('WorkflowRun', workflowRunSchema);
