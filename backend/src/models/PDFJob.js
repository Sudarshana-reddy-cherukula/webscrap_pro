const mongoose = require('mongoose');

const pdfJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true,
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
  },
  filePath: {
    type: String,
    required: [true, 'File path is required'],
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
  },
  operation: {
    type: String,
    enum: [
      'extract-text', 'extract-images', 'extract-metadata',
      'convert-to-docx', 'convert-to-txt',
      'modify-text', 'add-watermark', 'add-security',
      'split-pdf', 'merge-pdf', 'rotate-pages', 'crop-pages',
    ],
    required: [true, 'Operation is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  options: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
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
  downloadCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

pdfJobSchema.pre('save', function (next) {
  if (this.startedAt && this.completedAt) {
    this.duration = this.completedAt - this.startedAt;
  }
  next();
});

pdfJobSchema.methods.startJob = function () {
  this.status = 'processing';
  this.startedAt = new Date();
  return this.save();
};

pdfJobSchema.methods.completeJob = function (results) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.progress = 100;
  if (results) {
    this.results = results;
  }
  return this.save();
};

pdfJobSchema.methods.failJob = function (error) {
  this.status = 'failed';
  this.completedAt = new Date();
  if (error) {
    this.error = error;
  }
  return this.save();
};

pdfJobSchema.methods.updateProgress = function (progress) {
  this.progress = Math.min(100, Math.max(0, progress));
  return this.save();
};

module.exports = mongoose.model('PDFJob', pdfJobSchema);
