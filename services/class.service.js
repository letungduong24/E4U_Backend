const User = require('../models/user.model');
const ClassModel = require('../models/class.model');

// Class management
const createClass = async (payload) => {
  const { name, code, description, homeroomTeacher, students = [], maxStudents = 30, isActive = true } = payload;
  
  // Validate teacher
  const teacher = await User.findById(homeroomTeacher);
  if (!teacher) throw new Error('Homeroom teacher not found');
  if (teacher.role !== 'teacher') throw new Error('User is not a teacher');
  
  // Validate students (if provided)
  if (students.length > 0) {
    const studentDocs = await User.find({ _id: { $in: students } });
    const invalidStudents = studentDocs.filter(s => s.role !== 'student');
    if (invalidStudents.length > 0) {
      throw new Error('Some users are not students');
    }
  }
  
  const classDoc = await ClassModel.create({
    name,
    code,
    description,
    homeroomTeacher,
    students,
    maxStudents,
    isActive
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
  // Validate teacher if being updated
  if (updateData.homeroomTeacher) {
    const teacher = await User.findById(updateData.homeroomTeacher);
    if (!teacher) throw new Error('Homeroom teacher not found');
    if (teacher.role !== 'teacher') throw new Error('User is not a teacher');
  }
  
  const allowed = ['name', 'code', 'description', 'homeroomTeacher', 'maxStudents', 'isActive'];
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
  // Validate all users are students
  const users = await User.find({ _id: { $in: studentIds } }, '_id role');
  const invalidUsers = users.filter(u => u.role !== 'student');
  if (invalidUsers.length > 0) {
    throw new Error('Some users are not students');
  }
  
  const existingIds = users.map(s => s._id);
  
  // Add students to class
  const cls = await ClassModel.findByIdAndUpdate(
    classId,
    { $addToSet: { students: { $each: existingIds } } },
    { new: true }
  ).populate('homeroomTeacher', 'firstName lastName email role')
   .populate('students', 'firstName lastName email role');
  if (!cls) throw new Error('Class not found');

  // Add class to students
  await User.updateMany(
    { _id: { $in: existingIds } },
    { $addToSet: { classes: classId } }
  );

  return cls;
};

const removeStudents = async (classId, studentIds = []) => {
  // Remove students from class
  const cls = await ClassModel.findByIdAndUpdate(
    classId,
    { $pull: { students: { $in: studentIds } } },
    { new: true }
  ).populate('homeroomTeacher', 'firstName lastName email role')
   .populate('students', 'firstName lastName email role');
  if (!cls) throw new Error('Class not found');

  // Remove class from students
  await User.updateMany(
    { _id: { $in: studentIds } },
    { $pull: { classes: classId } }
  );

  return cls;
};

module.exports = {
  createClass,
  listClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudents,
  removeStudents
};
