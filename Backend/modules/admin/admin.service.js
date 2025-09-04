const User = require('../user/user.model');

// List users with basic pagination and optional role/status filters
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

// Get single user by id (admin)
const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// Update user by admin (can change role, isActive, profile fields)
const updateUserByAdmin = async (userId, updateData) => {
  const allowedFields = ['firstName', 'lastName', 'role', 'isActive', 'email'];
  const payload = {};
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(updateData, key)) {
      payload[key] = updateData[key];
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    payload,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

// Delete user (soft deactivate preferred; here hard delete for example)
const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return { message: 'User deleted' };
};

// Toggle activate/deactivate user
const setUserActiveStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true, runValidators: true }
  ).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

module.exports = {
  listUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
  setUserActiveStatus
};


