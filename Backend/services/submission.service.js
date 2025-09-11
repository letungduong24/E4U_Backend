const Submission = require("../models/submission.model");
const Homework = require("../models/homework.model");
const User = require("../models/user.model");

// Nộp bài tập
const createSubmission = async (payload) => {
  const { homeworkId, studentId, file } = payload;
  const homework = await Homework.findById(homeworkId);
  if (!homework) throw new Error("Homework not found");
  const existingSubmission = await Submission.findOne({
    homeworkId,
    studentId,
  });
  if (existingSubmission) {
    throw new Error("You have already submitted this homework");
  }

  if (new Date() > new Date(homework.deadline)) {
    throw new Error("Submission deadline has passed");
  }
  
  const submission = await Submission.create({
    homeworkId,
    studentId,
    file,
    status: "submitted",
  });
  
  await submission.populate("studentId", "name email");
  await submission.populate("homeworkId", "description deadline classId");
  return submission;
};

// Sửa bài (khi chưa quá hạn và chưa chấm điểm)
const updateSubmission = async (submissionId, updateData) => {
  const submission = await Submission.findById(submissionId);
  if (!submission) throw new Error("Submission not found");

  if (submission.status === "graded") {
    throw new Error("Cannot update a graded submission");
  }

  const homework = await Homework.findById(submission.homeworkId);
  if (new Date() > new Date(homework.deadline)) {
    throw new Error("Cannot update submission after the deadline");
  }
  
  const updatedSubmission = await Submission.findByIdAndUpdate(
    submissionId,
    updateData,
    { new: true, runValidators: true }
  );
  
  await updatedSubmission.populate("studentId", "name email");
  await updatedSubmission.populate("homeworkId", "description deadline classId");
  return updatedSubmission;
};

// Chấm điểm và nhận xét 
const gradeSubmission = async (submissionId, teacherId, { grade, feedback }) => {
  const submission = await Submission.findById(submissionId).populate("homeworkId");
  if (!submission) throw new Error("Submission not found");
  
  
  if (String(submission.homeworkId.teacherId) !== String(teacherId)) {
    throw new Error("You are not authorized to grade this submission");
  }
  

  submission.grade = grade;
  submission.feedback = feedback;
  submission.status = "graded";
  submission.gradedAt = new Date();
  
  await submission.save();
  
  await submission.populate("studentId", "name email");
  await submission.populate("homeworkId", "description deadline classId");
  return submission;
};


//xem cac bai minh nop
const getStudentSubmissions = async (studentId, { status }) => {
  const query = { studentId };
  if (status) query.status = status;
  
  const submissions = await Submission.find(query)
    .populate("homeworkId", "description deadline classId")
    .sort({ submittedAt: -1 });
  
  return submissions;
};

// xem chi tiet bai da nop
const getSubmissionById = async (submissionId) => {
  const submission = await Submission.findById(submissionId);
  
  if (!submission) throw new Error("Submission not found");
  
  await submission.populate("studentId", "name email");
  await submission.populate("homeworkId", "description deadline classId");
  return submission;
};

// Lấy danh sách submission theo classId
const getSubmissionsByClassId = async (classId, { status, homeworkId } = {}) => {
  // Tìm tất cả homework của class này
  const homeworks = await Homework.find({ classId }).select('_id');
  const homeworkIds = homeworks.map(hw => hw._id);
  
  if (homeworkIds.length === 0) {
    return [];
  }
  
  // Build query
  const query = { homeworkId: { $in: homeworkIds } };
  if (status) query.status = status;
  if (homeworkId) query.homeworkId = homeworkId;
  
  const submissions = await Submission.find(query)
    .populate("studentId", "name email")
    .populate("homeworkId", "description deadline classId")
    .sort({ createdAt: -1 });
  
  return submissions;
};

// Lấy submissions theo homework ID
const getSubmissionsByHomeworkId = async (homeworkId) => {
  const homework = await Homework.findById(homeworkId).populate("classId", "name code");
  if (!homework) {
    throw new Error("Homework not found");
  }

  const submissions = await Submission.find({ homeworkId })
    .populate("studentId", "name email")
    .sort({ createdAt: -1 });
  
  return {
    homework,
    submissions
  };
};

module.exports = {
  createSubmission,
  updateSubmission,
  gradeSubmission,
  getStudentSubmissions,
  getSubmissionById,
  getSubmissionsByClassId,
  getSubmissionsByHomeworkId
};
