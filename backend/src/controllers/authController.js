const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/errorMiddleware');
const { getGoogleAuthURL, getGoogleUser } = require('../config/googleOAuth');
const { sendEmail, templates } = require('../utils/emailService');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    sendEmail({ to: email, ...templates.welcome(name) }).catch(() => {});

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated',
    });
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscription: user.subscription,
          usage: user.usage,
          lastLogin: user.lastLogin,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        usage: user.usage,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  
  const user = await User.findById(req.user._id);
  
  if (name) {
    user.name = name;
  }
  
  await user.save();
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        usage: user.usage,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    },
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user._id).select('+password');
  
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }
  
  user.password = newPassword;
  await user.save();
  
  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required',
    });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const Session = require('../models/Session');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Invalidate old session
    await Session.findOneAndUpdate(
      { userId: user._id, token, active: true },
      { active: false }
    );
    
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Create new session
    await Session.create({
      userId: user._id,
      token: newRefreshToken,
      device: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const tokenExpires = new Date(Date.now() + 60 * 60 * 1000);

    const user = await User.findOne({ email });
    if (user) {
      user.resetOtp = otp;
      user.resetOtpExpires = otpExpires;
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = tokenExpires;
      await user.save();

      sendEmail({ to: email, ...templates.otp(user.name, otp) }).catch(() => {});
    }

    res.json({
      success: true,
      message: 'If an account exists with that email, a reset code has been sent.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to process request',
      error: error.message,
    });
  }
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetOtp: otp,
      resetOtpExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token: user.resetPasswordToken,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message,
    });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    user.password = password;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message,
    });
  }
});

const googleLogin = asyncHandler(async (req, res) => {
  const url = getGoogleAuthURL();
  res.redirect(url);
});

const googleCallback = asyncHandler(async (req, res) => {
  const { code, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (error) {
    return res.redirect(`${frontendUrl}/login?error=google_denied`);
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/login?error=no_code`);
  }

  try {
    const { googleId, email, name, avatar } = await getGoogleUser(code);

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      user.googleId = googleId;
      user.avatar = avatar;
      user.provider = user.provider === 'local' ? 'local' : 'google';
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        provider: 'google',
        lastLogin: new Date(),
      });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.redirect(`${frontendUrl}/login?token=${token}&refreshToken=${refreshToken}`);
  } catch (err) {
    console.error('Google OAuth error:', err.message);
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  forgotPassword,
  verifyOtp,
  resetPassword,
  googleLogin,
  googleCallback,
};
