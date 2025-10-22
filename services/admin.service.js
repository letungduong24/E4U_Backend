const User = require('../models/user.model');
const Class = require('../models/class.model');
const authService = require('./auth.service');
const studentClassService = require('./student_class.service');
const mongoose = require('mongoose');

// User management
const listUsers = async ({ role, classId, q }) => {
  const query = {};
  if (role) query.role = role;
  
  // Handle search by name
  if (q) {
    query.$or = [
      { firstName: new RegExp(q, 'i') },
      { lastName: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') }
    ];
  }
  
  // Handle classId filter - filter users by class (either as current class or teaching class)
  if (classId) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      throw new Error('Invalid classId format');
    }
    
    // Convert string to ObjectId
    const objectIdClassId = new mongoose.Types.ObjectId(classId);
    
    // If we already have $or from search, we need to combine with classId filter
    if (query.$or) {
      // User has both search and classId filter
      query.$and = [
        { $or: query.$or }, // Search conditions
        { $or: [
          { currentClass: objectIdClassId },
          { teachingClass: objectIdClassId }
        ]} // ClassId conditions
      ];
      delete query.$or; // Remove the original $or
    } else {
      // Only classId filter
      query.$or = [
        { currentClass: objectIdClassId },
        { teachingClass: objectIdClassId }
      ];
    }
  }

  const users = await User.find(query)
    .select('-password')
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
    })
    .sort({ createdAt: -1 });

  return users;
};

// Create user by admin (reuse auth service)
const createUser = async (userData) => {
  const { role, profile, ...registerData } = userData;
  
  // Use auth service register function
  const { user, token } = await authService.register(registerData);
  
  // Update role and profile if provided
  const updateData = {};
  if (role) updateData.role = role;
  if (profile) {
    // Validate profile fields according to user model
    const validProfile = {};
    if (profile.phone) validProfile['profile.phone'] = profile.phone;
    if (profile.dateOfBirth) validProfile['profile.dateOfBirth'] = profile.dateOfBirth;
    if (profile.gender) validProfile['profile.gender'] = profile.gender;
    if (profile.address) validProfile['profile.address'] = profile.address;
    if (profile.notification !== undefined) validProfile['profile.notification'] = profile.notification;
    if (profile.avatar) validProfile['profile.avatar'] = profile.avatar;
    
    Object.assign(updateData, validProfile);
  }
  
  // Update user with all data
  if (Object.keys(updateData).length > 0) {
    await User.findByIdAndUpdate(user._id, updateData);
  }
  
  // Return user with full populate (without token) - refresh after updates
  const userWithPopulate = await User.findById(user._id)
    .select('-password')
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
  
  return userWithPopulate;
};

const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select('-password')
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
  if (!user) throw new Error('User not found');
  return user;
};

const updateUserByAdmin = async (userId, updateData) => {
  const { profile, ...otherData } = updateData;
  
  // Handle basic fields (không cho phép thay đổi role)
  const allowedFields = ['firstName', 'lastName', 'isActive', 'email'];
  const payload = {};
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(otherData, key)) payload[key] = otherData[key];
  }
  
  // Handle profile fields
  if (profile) {
    // Validate profile fields according to user model
    if (profile.phone) payload['profile.phone'] = profile.phone;
    if (profile.dateOfBirth) payload['profile.dateOfBirth'] = profile.dateOfBirth;
    if (profile.gender) payload['profile.gender'] = profile.gender;
    if (profile.address) payload['profile.address'] = profile.address;
    if (profile.notification !== undefined) payload['profile.notification'] = profile.notification;
    if (profile.avatar) payload['profile.avatar'] = profile.avatar;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    payload,
    { new: true, runValidators: true }
  )
    .select('-password')
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

  if (!user) throw new Error('User not found');
  return user;
};

const deleteUser = async (userId) => {
  // Check if user exists first
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  // Prevent deletion of admin users
  if (user.role === 'admin') {
    throw new Error('Cannot delete admin users');
  }
  
  // Delete the user
  await User.findByIdAndDelete(userId);
  return { message: 'User deleted' };
};

const setUserActiveStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true, runValidators: true }
  )
    .select('-password')
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
  if (!user) throw new Error('User not found');
  return user;
};



module.exports = {
  // user
  listUsers,
  createUser,
  getUserById,
  updateUserByAdmin,
  deleteUser,
  setUserActiveStatus
};

