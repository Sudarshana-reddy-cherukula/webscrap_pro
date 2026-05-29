const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'API key name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  keyPrefix: {
    type: String,
    required: true,
  },
  lastUsedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

apiKeySchema.pre('save', function (next) {
  if (this.isNew) {
    const rawKey = crypto.randomBytes(32).toString('hex');
    this.keyPrefix = rawKey.substring(0, 8);
    this.key = crypto.createHash('sha256').update(rawKey).digest('hex');
    this._rawKey = rawKey;
  }
  next();
});

apiKeySchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (this._rawKey) {
    obj.key = `wsp_${this._rawKey}`;
  } else {
    delete obj.key;
  }
  delete obj._rawKey;
  return obj;
};

apiKeySchema.statics.validateKey = async function (rawKey) {
  const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
  return await this.findOne({ key: hash, active: true, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] });
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
