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
} = require('../validations');

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, validateRequest(updateProfileSchema), authController.updateProfile);
router.put('/change-password', protect, validateRequest(changePasswordSchema), authController.changePassword);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
