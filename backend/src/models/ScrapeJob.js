const mongoose = require('mongoose');

const scrapeJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetUrl: {
    type: String,
    required: [true, 'Target URL is required'],
    trim: true,
  },
  scrapingType: {
    type: String,
    enum: ['url', 'images', 'links', 'metadata'],
    required: [true, 'Scraping type is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'paused'],
    default: 'pending',
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  options: {
    extractText: {
      type: Boolean,
      default: true,
    },
    extractTables: {
      type: Boolean,
      default: false,
    },
    extractImages: {
      type: Boolean,
      default: false,
    },
    extractLinks: {
      type: Boolean,
      default: false,
    },
    extractMetadata: {
      type: Boolean,
      default: true,
    },
    waitForSelector: {
      type: String,
    },
    timeout: {
      type: Number,
      default: 30000,
    },
    userAgent: {
      type: String,
    },
    headers: {
      type: Map,
      of: String,
    },
  },
  results: {
    text: {
      type: String,
    },
    tables: [{
      headers: [String],
      rows: [[String]],
    }],
    images: [{
      url: String,
      alt: String,
      src: String,
    }],
    links: [{
      text: String,
      url: String,
    }],
    metadata: {
      title: String,
      description: String,
      keywords: [String],
      author: String,
      publishedDate: Date,
    },
    screenshots: [{
      path: String,
      timestamp: Date,
    }],
  },
  error: {
    message: String,
    stack: String,
    code: String,
  },
  queueJobId: {
    type: String,
  },
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  duration: {
    type: Number,
  },
  fileSize: {
    type: Number,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

scrapeJobSchema.pre('save', function (next) {
  if (this.startedAt && this.completedAt) {
    this.duration = this.completedAt - this.startedAt;
  }
  next();
});

scrapeJobSchema.methods.startJob = function () {
  this.status = 'processing';
  this.startedAt = new Date();
  return this.save();
};

scrapeJobSchema.methods.completeJob = function (results) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.progress = 100;
  if (results) {
    this.results = results;
  }
  return this.save();
};

scrapeJobSchema.methods.failJob = function (error) {
  this.status = 'failed';
  this.completedAt = new Date();
  if (error) {
    this.error = error;
  }
  return this.save();
};

scrapeJobSchema.methods.updateProgress = function (progress) {
  this.progress = Math.min(100, Math.max(0, progress));
  return this.save();
};

module.exports = mongoose.model('ScrapeJob', scrapeJobSchema);
