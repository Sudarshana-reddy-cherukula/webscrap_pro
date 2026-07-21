const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, settingsController.getSettings);
router.put('/', protect, settingsController.updateSettings);

router.get('/profile', protect, settingsController.getProfile);
router.put('/profile', protect, settingsController.updateProfile);

router.get('/security', protect, settingsController.getSecuritySettings);
router.post('/security/2fa/enable', protect, settingsController.enable2FA);
router.post('/security/2fa/disable', protect, settingsController.disable2FA);
router.post('/security/2fa/verify', protect, settingsController.verify2FA);

router.get('/api-keys', protect, settingsController.getApiKeys);
router.post('/api-keys', protect, settingsController.createApiKey);
router.delete('/api-keys/:keyId', protect, settingsController.deleteApiKey);
router.post('/api-keys/:keyId/revoke', protect, settingsController.revokeApiKey);

router.get('/sessions', protect, settingsController.getActiveSessions);
router.delete('/sessions/:sessionId', protect, settingsController.revokeSession);

router.get('/theme', protect, settingsController.getThemeSettings);
router.put('/theme', protect, settingsController.updateTheme);

router.get('/notifications', protect, settingsController.getNotificationPreferences);
router.put('/notifications', protect, settingsController.updateNotificationPreferences);

router.get('/export-defaults', protect, settingsController.getExportDefaults);
router.put('/export-defaults', protect, settingsController.updateExportDefaults);

router.post('/reset', protect, settingsController.resetToDefaults);
router.get('/export', protect, settingsController.exportSettings);
router.post('/import', protect, settingsController.importSettings);
router.get('/audit-log', protect, settingsController.getAuditLog);

router.delete('/account', protect, settingsController.deleteAccount);

module.exports = router;
