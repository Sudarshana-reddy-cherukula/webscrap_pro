const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScrapeJob',
    required: true,
  },
  title: {
    type: String,
    default: 'New Chat',
  },
  messages: [chatMessageSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  messageCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ jobId: 1 });

chatSessionSchema.pre('save', function(next) {
  this.messageCount = this.messages.length;
  next();
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);
