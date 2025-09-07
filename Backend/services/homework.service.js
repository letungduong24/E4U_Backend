const Homework = require('../models/homework.model');
const User = require('../models/user.model');
const Class = require('../models/class.model');

// Create homework assignment
const createHomework = async (payload) => {
  const {
    id,
    Description,
    ClassId,
    Deadline,
    Files = []
  } = payload;

  // Validate class
  const classDoc = await Class.findById(ClassId);
  if (!classDoc) throw new Error('Class not found');

  // Validate deadline
  if (new Date(Deadline) <= new Date()) {
    throw new Error('Deadline must be in the future');
  }

  // Check if assignment ID already exists
  const existingAssignment = await Homework.findOne({ id });
  if (existingAssignment) {
    throw new Error('Assignment ID already exists');
  }

  const homework = await Homework.create({
    id,
    Description,
    ClassId,
    Deadline: new Date(Deadline),
    Files
  });

  return await homework.populate('ClassId', 'name code');
};

// Get homework by MongoDB ID
const getHomeworkById = async (homeworkId) => {
  const homework = await Homework.findById(homeworkId)
    .populate('ClassId', 'name code');
  
  if (!homework) throw new Error('Homework not found');
  return homework;
};

// Get homework by assignment ID
const getHomeworkByAssignmentId = async (assignmentId) => {
  const homework = await Homework.findByAssignmentId(assignmentId);
  
  if (!homework) throw new Error('Homework not found');
  return homework;
};

// List homeworks with filters
const listHomeworks = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    ClassId,
    search,
    sortBy = 'Deadline',
    sortOrder = 'asc'
  } = filters;

  const query = {};

  if (ClassId) query.ClassId = ClassId;
  if (search) {
    query.$or = [
      { id: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const homeworks = await Homework.find(query)
    .populate('ClassId', 'name code')
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

// Update homework
const updateHomework = async (homeworkId, updateData) => {
  const homework = await Homework.findById(homeworkId);
  if (!homework) throw new Error('Homework not found');

  // Validate deadline if being updated
  if (updateData.Deadline && new Date(updateData.Deadline) <= new Date()) {
    throw new Error('Deadline must be in the future');
  }

  // Check if assignment ID is being updated and if it already exists
  if (updateData.id && updateData.id !== homework.id) {
    const existingAssignment = await Homework.findOne({ id: updateData.id });
    if (existingAssignment) {
      throw new Error('Assignment ID already exists');
    }
  }

  const updatedHomework = await Homework.findByIdAndUpdate(
    homeworkId,
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate('ClassId', 'name code');

  return updatedHomework;
};

// Delete homework
const deleteHomework = async (homeworkId) => {
  const homework = await Homework.findById(homeworkId);
  if (!homework) throw new Error('Homework not found');

  await Homework.findByIdAndDelete(homeworkId);
  return { message: 'Homework deleted successfully' };
};



module.exports = {
  createHomework,
  getHomeworkById,
  getHomeworkByAssignmentId,
  listHomeworks,
  updateHomework,
  deleteHomework
};
