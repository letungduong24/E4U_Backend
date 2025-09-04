const User = require('../user/user.model');
const ClassModel = require('./class.model');

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

// Class management
const createClass = async (payload) => {
  const { name, code, description, homeroomTeacher, students = [], schedule = [], startDate, endDate, metadata } = payload;
  const teacher = await User.findById(homeroomTeacher);
  if (!teacher) throw new Error('Homeroom teacher not found');
  const classDoc = await ClassModel.create({
    name,
    code,
    description,
    homeroomTeacher,
    students,
    schedule,
    startDate,
    endDate,
    metadata
  });
  return classDoc;
};

const listClasses = async ({ page = 1, limit = 10, teacher, q }) => {
  const query = {};
  if (teacher) query.homeroomTeacher = teacher;
  if (q) query.$or = [{ name: new RegExp(q, 'i') }, { code: new RegExp(q, 'i') }];
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    ClassModel.find(query)
      .populate('homeroomTeacher', 'firstName lastName email role')
      .populate('students', 'firstName lastName email role')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    ClassModel.countDocuments(query)
  ]);
  return {
    items,
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit)) || 1
  };
};

const getClassById = async (classId) => {
  const cls = await ClassModel.findById(classId)
    .populate('homeroomTeacher', 'firstName lastName email role')
    .populate('students', 'firstName lastName email role');
  if (!cls) throw new Error('Class not found');
  return cls;
};

const updateClass = async (classId, updateData) => {
  if (updateData.homeroomTeacher) {
    const teacher = await User.findById(updateData.homeroomTeacher);
    if (!teacher) throw new Error('Homeroom teacher not found');
  }
  const allowed = ['name', 'code', 'description'];
  const payload = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(updateData, key)) payload[key] = updateData[key];
  }
  const cls = await ClassModel.findByIdAndUpdate(classId, payload, { new: true, runValidators: true })
    .populate('homeroomTeacher', 'firstName lastName email role')
    .populate('students', 'firstName lastName email role');
  if (!cls) throw new Error('Class not found');
  return cls;
};

const deleteClass = async (classId) => {
  const cls = await ClassModel.findByIdAndDelete(classId);
  if (!cls) throw new Error('Class not found');
  return { message: 'Class deleted' };
};

const addStudents = async (classId, studentIds = []) => {
  const existingStudents = await User.find({ _id: { $in: studentIds } }, '_id');
  const existingIds = existingStudents.map(s => s._id);
  const cls = await ClassModel.findByIdAndUpdate(
    classId,
    { $addToSet: { students: { $each: existingIds } } },
    { new: true }
  ).populate('homeroomTeacher', 'firstName lastName email role')
   .populate('students', 'firstName lastName email role');
  if (!cls) throw new Error('Class not found');
  return cls;
};

const removeStudents = async (classId, studentIds = []) => {
  const cls = await ClassModel.findByIdAndUpdate(
    classId,
    { $pull: { students: { $in: studentIds } } },
    { new: true }
  ).populate('homeroomTeacher', 'firstName lastName email role')
   .populate('students', 'firstName lastName email role');
  if (!cls) throw new Error('Class not found');
  return cls;
};

module.exports = {
  // user
  listUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
  setUserActiveStatus,
  // class
  createClass,
  listClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudents,
  removeStudents
};


