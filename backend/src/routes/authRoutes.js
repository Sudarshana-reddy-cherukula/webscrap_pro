const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} = require('../validations');

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, validateRequest(updateProfileSchema), authController.updateProfile);
router.put('/change-password', protect, validateRequest(changePasswordSchema), authController.changePassword);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/verify-otp', validateRequest(verifyOtpSchema), authController.verifyOtp);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);

module.exports = router;
