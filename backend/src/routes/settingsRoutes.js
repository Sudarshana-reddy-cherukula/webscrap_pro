const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/security', protect, settingsController.getSecuritySettings);
router.post('/security/2fa/enable', protect, settingsController.enable2FA);
router.post('/security/2fa/disable', protect, settingsController.disable2FA);
router.post('/security/2fa/verify', protect, settingsController.verify2FA);

router.get('/api-keys', protect, settingsController.getApiKeys);
router.post('/api-keys', protect, settingsController.createApiKey);
router.post('/api-keys/:keyId/revoke', protect, settingsController.revokeApiKey);

router.get('/sessions', protect, settingsController.getActiveSessions);
router.delete('/sessions/:sessionId', protect, settingsController.revokeSession);

router.delete('/account', protect, settingsController.deleteAccount);

module.exports = router;
