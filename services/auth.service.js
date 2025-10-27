const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const register = async (userData) => {
  const { email, password, firstName, lastName } = userData;

  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password
  });

  const token = generateToken(user._id);
  return {user, token}
};

const login = async (email, password) => {
  if (!email || !password) {
    throw new Error('Please provide email and password');
  }

  const user = await User.findByEmail(email).select('+password');
   
  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (!(await user.matchPassword(password))) {
    throw new Error('Invalid credentials');
  }
   
  user.lastLogin = new Date();
  await user.save();

  await user.populate({
    path: 'currentClass',
    select: 'name code description homeroomTeacher isActive'
  });
  
  if (user.currentClass && user.currentClass.homeroomTeacher) {
    await user.populate({
      path: 'currentClass.homeroomTeacher',
      select: 'firstName lastName'
    });
  }

  await user.populate({
    path: 'teachingClass',
    select: 'name code description homeroomTeacher isActive'
  });

  // Populate enrollmentHistory with full class details
  await user.populate({
    path: 'enrollmentHistory',
    select: 'status enrolledAt completedAt droppedAt notes',
    populate: {
      path: 'class',
      select: 'name code description homeroomTeacher maxStudents isActive',
      populate: {
        path: 'homeroomTeacher',
        select: 'firstName lastName email'
      }
    }
  });

  const token = generateToken(user._id);
  return {user, token}
};

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

const getMe = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'currentClass',
      select: 'name code description homeroomTeacher isActive',
      populate: {
        path: 'homeroomTeacher',
        select: 'firstName lastName'
      }
    })
    .populate({
      path: 'teachingClass',
      select: 'name code description homeroomTeacher isActive',
      populate: {
        path: 'homeroomTeacher',
        select: 'firstName lastName'
      }
    })
    .populate({
      path: 'enrollmentHistory',
      select: 'status enrolledAt completedAt droppedAt notes',
      populate: {
        path: 'class',
        select: 'name code description homeroomTeacher maxStudents isActive',
        populate: {
          path: 'homeroomTeacher',
          select: 'firstName lastName email'
        }
      }
    });
  
  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

const updateProfile = async (userId, updateData) => {
  const filteredData = { ...updateData };
  delete filteredData.password;
  delete filteredData.role;
  delete filteredData.email;
  delete filteredData.isActive;

  // Handle profile updates separately to avoid overwriting the entire profile object
  let profileUpdate = {};
  if (updateData.profile) {
    const { avatar, phone, dateOfBirth, gender, address, notification } = updateData.profile;
    
    if (avatar !== undefined) profileUpdate['profile.avatar'] = avatar;
    if (phone !== undefined) profileUpdate['profile.phone'] = phone;
    if (dateOfBirth !== undefined) profileUpdate['profile.dateOfBirth'] = dateOfBirth;
    if (gender !== undefined) profileUpdate['profile.gender'] = gender;
    if (address !== undefined) profileUpdate['profile.address'] = address;
    if (notification !== undefined) profileUpdate['profile.notification'] = notification;
    
    delete filteredData.profile;
  }

  // Merge profile updates with other updates
  const finalUpdateData = { ...filteredData, ...profileUpdate };

  const user = await User.findByIdAndUpdate(
    userId,
    finalUpdateData,
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

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new Error('User not found');
  }

  if (!(await user.matchPassword(currentPassword))) {
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  return user;
};

const forgotPassword = async (email) => {
  const user = await User.findByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; 

  await user.save();

  return resetToken;
};

const resetPassword = async (token, newPassword) => {
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
};
