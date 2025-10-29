const Homework = require("../models/homework.model");
const User = require("../models/user.model");
const Class = require("../models/class.model");

// Create homework assignment
const createHomework = async (payload) => {
  const { title, description, classId, deadline, file, teacherId } = payload;
  console.log(payload);
  const classDoc = await Class.findById(classId);
  if (!classDoc) throw new Error("Class not found");

  if (new Date(deadline) <= new Date()) {
    throw new Error("Deadline must be in the future");
  }

  const homework = await Homework.create({
    title,
    description,
    classId,
    deadline: new Date(deadline),
    file,
    teacherId,
  });

  return await homework.populate("classId", "name code");
};

const getHomeworkById = async (homeworkId) => {
  const homework = await Homework.findById(homeworkId).populate(
    "classId",
    "name code"
  );

  if (!homework) throw new Error("Homework not found");
  return homework;
};

const getHomeworkByClassId = async (classId) => {
  const homeworks = await Homework.find({ classId }).populate(
    "classId",
    "name code"
  );

  if (!homeworks) throw new Error("Homework not found");
  return homeworks;
};

const listHomeworks = async (filters = {}) => {
  const {
    classId,
    teacherId,
    search,
    deadline,
    sortBy = "deadline",
    sortOrder = "asc",
  } = filters;

  const query = {};

  if (classId) query.classId = classId;
  if (teacherId) query.teacherId = teacherId;
  
  // Tìm kiếm theo cả title và description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  // Xử lý filter deadline (dùng cho overdue assignments)
  if (deadline && typeof deadline === 'object') {
    query.deadline = deadline;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const homeworks = await Homework.find(query)
    .populate("classId", "name code")
    .sort(sortOptions);

  return {
    homeworks
  };
};

const updateHomework = async (homeworkId, updateData) => {
  const homework = await Homework.findById(homeworkId);
  if (!homework) throw new Error("Homework not found");

  if (updateData.Deadline && new Date(updateData.Deadline) <= new Date()) {
    throw new Error("Deadline must be in the future");
  }

  const updatedHomework = await Homework.findByIdAndUpdate(
    homeworkId,
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate("classId", "name code");

  return updatedHomework;
};

const deleteHomework = async (homeworkId) => {
  const homework = await Homework.findById(homeworkId);
  if (!homework) throw new Error("Homework not found");

  await Homework.findByIdAndDelete(homeworkId);
  return { message: "Homework deleted successfully" };
};

module.exports = {
  createHomework,
  getHomeworkById,
  listHomeworks,
  updateHomework,
  deleteHomework,
  getHomeworkByClassId,
};
