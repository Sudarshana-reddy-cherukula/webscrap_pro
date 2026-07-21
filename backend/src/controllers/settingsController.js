const speakeasy = require('speakeasy');
const crypto = require('crypto');
const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const Session = require('../models/Session');
const ScrapeJob = require('../models/ScrapeJob');
const PDFJob = require('../models/PDFJob');
const Export = require('../models/Export');
const { asyncHandler } = require('../middlewares/errorMiddleware');
const { generateToken } = require('../middlewares/authMiddleware');

const getSecuritySettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    data: {
      twoFAEnabled: user.twoFactorEnabled || false,
    },
  });
});

const enable2FA = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.twoFactorEnabled) {
    return res.status(400).json({ success: false, message: '2FA is already enabled' });
  }

  const secret = speakeasy.generateSecret({
    name: `WebScrap Pro (${user.email})`,
    length: 20,
  });

  const backupCodes = Array.from({ length: 8 }, () => ({
    code: crypto.randomBytes(4).toString('hex').toUpperCase(),
    used: false,
  }));

  user.twoFactorSecret = secret.base32;
  user.twoFactorEnabled = true;
  user.backupCodes = backupCodes;
  await user.save();

  res.json({
    success: true,
    message: '2FA enabled successfully',
    data: {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
      backupCodes: backupCodes.map(b => b.code),
    },
  });
});

const disable2FA = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!user.twoFactorEnabled) {
    return res.status(400).json({ success: false, message: '2FA is not enabled' });
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(400).json({ success: false, message: 'Password is incorrect' });
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  user.backupCodes = [];
  await user.save();

  res.json({ success: true, message: '2FA disabled successfully' });
});

const verify2FA = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Verification code is required' });
  }

  const user = await User.findById(req.user._id);
  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    return res.status(400).json({ success: false, message: '2FA is not configured' });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 2,
  });

  if (verified) {
    return res.json({ success: true, message: 'Code verified successfully' });
  }

  const backupCode = user.backupCodes.find(b => b.code === code && !b.used);
  if (backupCode) {
    backupCode.used = true;
    await user.save();
    return res.json({ success: true, message: 'Backup code used successfully' });
  }

  res.status(400).json({ success: false, message: 'Invalid verification code' });
});

const getApiKeys = asyncHandler(async (req, res) => {
  const keys = await ApiKey.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({
    success: true,
    data: {
      keys: keys.map(k => ({
        id: k._id,
        name: k.name,
        key: k.keyPrefix ? `${k.keyPrefix}...${k._id.toString().slice(-4)}` : '...',
        createdAt: k.createdAt,
        lastUsedAt: k.lastUsedAt,
        expiresAt: k.expiresAt,
        active: k.active,
      })),
    },
  });
});

const createApiKey = asyncHandler(async (req, res) => {
  const { name, expiresIn } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'API key name is required' });
  }

  const apiKey = new ApiKey({
    userId: req.user._id,
    name: name.trim(),
    expiresAt: expiresIn ? new Date(Date.now() + parseDuration(expiresIn)) : null,
  });

  await apiKey.save();

  res.status(201).json({
    success: true,
    message: 'API key created successfully',
    data: apiKey.toJSON(),
  });
});

const revokeApiKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const apiKey = await ApiKey.findOne({ _id: keyId, userId: req.user._id });
  if (!apiKey) {
    return res.status(404).json({ success: false, message: 'API key not found' });
  }

  apiKey.active = false;
  await apiKey.save();

  res.json({ success: true, message: 'API key revoked successfully' });
});

const getActiveSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ userId: req.user._id, active: true }).sort({ lastActivity: -1 });
  res.json({
    success: true,
    data: {
      sessions: sessions.map(s => ({
        id: s._id,
        device: s.device,
        ipAddress: s.ipAddress,
        lastActivity: s.lastActivity,
        createdAt: s.createdAt,
      })),
    },
  });
});

const revokeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await Session.findOne({ _id: sessionId, userId: req.user._id });
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  if (String(session._id) === String(req.sessionId)) {
    return res.status(400).json({ success: false, message: 'Cannot revoke current session' });
  }

  session.active = false;
  await session.save();

  res.json({ success: true, message: 'Session revoked successfully' });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required to delete account' });
  }

  const user = await User.findById(req.user._id).select('+password');
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(400).json({ success: false, message: 'Password is incorrect' });
  }

  await Promise.all([
    ScrapeJob.deleteMany({ userId: user._id }),
    PDFJob.deleteMany({ userId: user._id }),
    Export.deleteMany({ userId: user._id }),
    ApiKey.deleteMany({ userId: user._id }),
    Session.deleteMany({ userId: user._id }),
    User.findByIdAndDelete(user._id),
  ]);

  res.json({ success: true, message: 'Account deleted successfully' });
});

function parseDuration(str) {
  const match = str.match(/^(\d+)([dhms])$/);
  if (!match) return 90 * 24 * 60 * 60 * 1000;
  const num = parseInt(match[1]);
  switch (match[2]) {
    case 'd': return num * 24 * 60 * 60 * 1000;
    case 'h': return num * 60 * 60 * 1000;
    case 'm': return num * 60 * 1000;
    case 's': return num * 1000;
    default: return 90 * 24 * 60 * 60 * 1000;
  }
}

const getSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    data: {
      theme: user.settings?.theme || 'system',
      notifications: user.settings?.notifications || { email: true, browser: true },
      exportDefaults: user.settings?.exportDefaults || { format: 'csv', includeMetadata: true },
    },
  });
});

const updateSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.settings = { ...user.settings, ...req.body };
  await user.save();
  res.json({ success: true, message: 'Settings updated', data: user.settings });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;
  await user.save();
  res.json({
    success: true,
    message: 'Profile updated',
    data: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
  });
});

const deleteApiKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const apiKey = await ApiKey.findOneAndDelete({ _id: keyId, userId: req.user._id });
  if (!apiKey) {
    return res.status(404).json({ success: false, message: 'API key not found' });
  }
  res.json({ success: true, message: 'API key deleted' });
});

const getThemeSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: { theme: user.settings?.theme || 'system' } });
});

const updateTheme = asyncHandler(async (req, res) => {
  const { theme } = req.body;
  const user = await User.findById(req.user._id);
  user.settings = { ...user.settings, theme };
  await user.save();
  res.json({ success: true, message: 'Theme updated', data: { theme } });
});

const getNotificationPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user.settings?.notifications || { email: true, browser: true } });
});

const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.settings = { ...user.settings, notifications: req.body };
  await user.save();
  res.json({ success: true, message: 'Notifications updated', data: user.settings.notifications });
});

const getExportDefaults = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user.settings?.exportDefaults || { format: 'csv', includeMetadata: true } });
});

const updateExportDefaults = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.settings = { ...user.settings, exportDefaults: req.body };
  await user.save();
  res.json({ success: true, message: 'Export defaults updated', data: user.settings.exportDefaults });
});

const resetToDefaults = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.settings = {};
  await user.save();
  res.json({ success: true, message: 'Settings reset to defaults' });
});

const exportSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const settings = {
    theme: user.settings?.theme || 'system',
    notifications: user.settings?.notifications || { email: true, browser: true },
    exportDefaults: user.settings?.exportDefaults || { format: 'csv', includeMetadata: true },
    exportedAt: new Date().toISOString(),
  };
  res.setHeader('Content-Disposition', 'attachment; filename=settings-backup.json');
  res.json(settings);
});

const importSettings = asyncHandler(async (req, res) => {
  const settings = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid settings file' });
  }
  const user = await User.findById(req.user._id);
  user.settings = {
    theme: settings.theme || 'system',
    notifications: settings.notifications || { email: true, browser: true },
    exportDefaults: settings.exportDefaults || { format: 'csv', includeMetadata: true },
  };
  await user.save();
  res.json({ success: true, message: 'Settings imported', data: user.settings });
});

const getAuditLog = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { logs: [], total: 0 } });
});

module.exports = {
  getSecuritySettings,
  enable2FA,
  disable2FA,
  verify2FA,
  getApiKeys,
  createApiKey,
  revokeApiKey,
  getActiveSessions,
  revokeSession,
  deleteAccount,
  getSettings,
  updateSettings,
  getProfile,
  updateProfile,
  deleteApiKey,
  getThemeSettings,
  updateTheme,
  getNotificationPreferences,
  updateNotificationPreferences,
  getExportDefaults,
  updateExportDefaults,
  resetToDefaults,
  exportSettings,
  importSettings,
  getAuditLog,
};
