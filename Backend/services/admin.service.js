const User = require('../models/user.model');

// User management
const listUsers = async ({ page = 1, limit = 10, role, isActive }) => {
  const query = {};
  if (role) query.role = role;
  if (typeof isActive === 'boolean') query.isActive = isActive;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    User.find(query).select('-password').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    User.countDocuments(query)
  ]);

  return {
    items,
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit)) || 1
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

const updateUserByAdmin = async (userId, updateData) => {
  const allowedFields = ['firstName', 'lastName', 'role', 'isActive', 'email'];
  const payload = {};
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(updateData, key)) payload[key] = updateData[key];
  }

  const user = await User.findByIdAndUpdate(
    userId,
    payload,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) throw new Error('User not found');
  return user;
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new Error('User not found');
  return { message: 'User deleted' };
};

const setUserActiveStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true, runValidators: true }
  ).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};


module.exports = {
  // user
  listUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
  setUserActiveStatus
};


