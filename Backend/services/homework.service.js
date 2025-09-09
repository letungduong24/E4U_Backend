const Homework = require('../models/homework.model');
const User = require('../models/user.model');
const Class = require('../models/class.model');

// Create homework assignment
const createHomework = async (payload) => {
  const {
    description,
    classId,
    deadline,
    file,
    teacherId
  } = payload;
  console.log(payload)
  const classDoc = await Class.findById(classId);
  if (!classDoc) throw new Error('Class not found');

  if (new Date(deadline) <= new Date()) {
    throw new Error('Deadline must be in the future');
  }

  const homework = await Homework.create({
    description,
    classId,
    deadline: new Date(deadline),
    file,
    teacherId
  });

  return await homework.populate('classId', 'name code');
};

const getHomeworkById = async (homeworkId) => {
  const homework = await Homework.findById(homeworkId)
    .populate('classId', 'name code');
  
  if (!listHomeworks) throw new Error('Homework not found');
  return homework;
};

const getHomeworkByClassId = async (classId) => {
  const homeworks = await Homework.find({classId})
    .populate('classId', 'name code');
  
  if (!homeworks) throw new Error('Homework not found');
  return homeworks;
};

const listHomeworks = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    classId,
    search,
    sortBy = 'deadline',
    sortOrder = 'asc'
  } = filters;

  const query = {};

  if (classId) query.classId = classId;
  if (search) query.description = { $regex: search, $options: 'i' };

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const homeworks = await Homework.find(query)
    .populate('classId', 'name code')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Homework.countDocuments(query);

  return {
    homeworks,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const updateHomework = async (homeworkId, updateData) => {
  const homework = await Homework.findById(homeworkId);
  if (!homework) throw new Error('Homework not found');

  if (updateData.Deadline && new Date(updateData.Deadline) <= new Date()) {
    throw new Error('Deadline must be in the future');
  }

  const updatedHomework = await Homework.findByIdAndUpdate(
    homeworkId,
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate('classId', 'name code');

  return updatedHomework;
};

const deleteHomework = async (homeworkId) => {
  const homework = await Homework.findById(homeworkId);
  if (!homework) throw new Error('Homework not found');

  await Homework.findByIdAndDelete(homeworkId);
  return { message: 'Homework deleted successfully' };
};



module.exports = {
  createHomework,
  getHomeworkById,
  listHomeworks,
  updateHomework,
  deleteHomework,
  getHomeworkByClassId
};
