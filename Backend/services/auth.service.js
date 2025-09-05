const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Set token cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Remove password from output
  user.password = undefined;

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      status: 'success',
      token,
      data: {
        user
      }
    });
};

// Register user
const register = async (userData) => {
  const { email, password, firstName, lastName } = userData;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password
  });

  return user;
};

// Login user
const login = async (email, password) => {
  // Check if email and password exist
  if (!email || !password) {
    throw new Error('Please provide email and password');
  }

  // Check if user exists
  const user = await User.findByEmail(email).select('+password');
   
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }

  // Check password
  if (!(await user.matchPassword(password))) {
    throw new Error('Invalid credentials');
  }
   
  // Update last login
  user.lastLogin = new Date();
  await user.save();

  return user;
};

// Logout user
const logout = (res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  return {
    status: 'success',
    message: 'User logged out successfully'
  };
};

// Get current user
const getMe = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

// Update user profile
const updateProfile = async (userId, updateData) => {
  // Remove fields that shouldn't be updated
  const filteredData = { ...updateData };
  delete filteredData.password;
  delete filteredData.role;
  delete filteredData.email;
  delete filteredData.isActive;

  const user = await User.findByIdAndUpdate(
    userId,
    filteredData,
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

// Change password
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new Error('User not found');
  }

  // Check current password
  if (!(await user.matchPassword(currentPassword))) {
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return user;
};

// Forgot password
const forgotPassword = async (email) => {
  const user = await User.findByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  return resetToken;
};

// Reset password
const resetPassword = async (token, newPassword) => {
  // Get hashed token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  // Set new password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return user;
};


module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  sendTokenResponse
};
