const mongoose = require('mongoose');

const exportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sourceType: {
    type: String,
    enum: ['scraping', 'pdf'],
    required: [true, 'Source type is required'],
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Source ID is required'],
  },
  exportType: {
    type: String,
    enum: ['csv', 'json', 'excel', 'txt', 'pdf'],
    required: [true, 'Export type is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  options: {
    includeHeaders: {
      type: Boolean,
      default: true,
    },
    dateFormat: {
      type: String,
      default: 'ISO',
    },
    encoding: {
      type: String,
      default: 'utf8',
    },
    delimiter: {
      type: String,
      default: ',',
    },
    sheetName: {
      type: String,
      default: 'Export',
    },
  },
  filePath: {
    type: String,
  },
  fileName: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  queueJobId: {
    type: String,
  },
  error: {
    message: String,
    stack: String,
    code: String,
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
}, {
  timestamps: true,
});

exportSchema.pre('save', function (next) {
  if (this.startedAt && this.completedAt) {
    this.duration = this.completedAt - this.startedAt;
  }
  next();
});

exportSchema.methods.startExport = function () {
  this.status = 'processing';
  this.startedAt = new Date();
  return this.save();
};

exportSchema.methods.completeExport = function (filePath, fileName, fileSize) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.filePath = filePath;
  this.fileName = fileName;
  this.fileSize = fileSize;
  return this.save();
};

exportSchema.methods.failExport = function (error) {
  this.status = 'failed';
  this.completedAt = new Date();
  if (error) {
    this.error = error;
  }
  return this.save();
};

exportSchema.methods.isExpired = function () {
  return this.expiresAt && this.expiresAt < new Date();
};

exportSchema.methods.incrementDownload = function () {
  this.downloadCount += 1;
  return this.save();
};

module.exports = mongoose.model('Export', exportSchema);
