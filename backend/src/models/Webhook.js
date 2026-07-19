const mongoose = require('mongoose');
const crypto = require('crypto');

const webhookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
  },
  secret: {
    type: String,
    select: false,
  },
  events: [{
    type: String,
    enum: ['scrape.completed', 'scrape.failed', 'pdf.completed', 'pdf.failed', 'export.completed', 'workflow.completed', 'workflow.failed'],
  }],
  enabled: {
    type: Boolean,
    default: true,
  },
  lastTriggered: {
    type: Date,
  },
  lastStatus: {
    type: Number,
  },
  failureCount: {
    type: Number,
    default: 0,
  },
  headers: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

webhookSchema.index({ userId: 1, enabled: 1 });

webhookSchema.pre('save', function (next) {
  if (!this.secret) {
    this.secret = crypto.randomBytes(32).toString('hex');
  }
  next();
});

webhookSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.secret;
  return obj;
};

webhookSchema.methods.verifySignature = function (payload, signature) {
  if (!this.secret || !signature) return false;
  const expected = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};

module.exports = mongoose.model('Webhook', webhookSchema);
