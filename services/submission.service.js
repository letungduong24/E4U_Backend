const Submission = require("../models/submission.model");
const Homework = require("../models/homework.model");
const User = require("../models/user.model");

// Nộp bài tập
const createSubmission = async (payload) => {
  const { homeworkId, studentId, file } = payload;
  
  // Lấy thông tin homework
  const homework = await Homework.findById(homeworkId).populate("classId", "name code");
  if (!homework) throw new Error("Homework not found");
  
  // Kiểm tra student có thuộc lớp của homework không
  if (student.currentClass.toString() !== homework.classId._id.toString()) {
    throw new Error("You can only submit homework for your own class");
  }
  
  // Kiểm tra đã nộp bài chưa
  const existingSubmission = await Submission.findOne({
    homeworkId,
    studentId,
  });
  if (existingSubmission) {
    throw new Error("You have already submitted this homework");
  }

  // Kiểm tra deadline
  if (new Date() > new Date(homework.deadline)) {
    throw new Error("Submission deadline has passed");
  }
  
  const submission = await Submission.create({
    homeworkId,
    studentId,
    file,
  });
  
  await submission.populate("studentId", "name email");
  await submission.populate("homeworkId", "description deadline classId");
  return submission;
};

// Sửa bài (khi chưa quá hạn và chưa chấm điểm)
const updateSubmission = async (submissionId, studentId, updateData) => {
  const submission = await Submission.findById(submissionId);

  if (!submission) throw new Error("Submission not found");

  // Kiểm tra ownership
  if (submission.studentId.toString() !== studentId.toString()) {
    throw new Error("You can only update your own submission");
  }

  // Lấy thông tin homework và class
  const homework = await Homework.findById(submission.homeworkId).populate("classId", "name code");
  if (!homework) throw new Error("Homework not found");
  
  // Lấy thông tin student để kiểm tra lớp
  const student = await User.findById(studentId).select("currentClass");
  if (!student) throw new Error("Student not found");
  
  // Kiểm tra student có thuộc lớp của homework không
  if (student.currentClass.toString() !== homework.classId._id.toString()) {
    throw new Error("You can only update submission for your own class homework");
  }

  if (submission.status === "graded") {
    throw new Error("Cannot update a graded submission");
  }

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
    .sort({ createdAt: -1 });
  
  return submissions;
};

// xem chi tiet bai da nop
const getSubmissionById = async (submissionId, studentId = null) => {
  const submission = await Submission.findById(submissionId);
  
  if (!submission) throw new Error("Submission not found");
  

  if (studentId && submission.studentId.toString() !== studentId.toString()) {
    throw new Error("You can only view your own submission");
  }
  
  await submission.populate("studentId", "name email currentClass");
  await submission.populate("homeworkId", "description deadline classId");
  
  // Kiểm tra student có thuộc lớp của homework không (nếu là student)
  if (studentId && submission.studentId.currentClass.toString() !== submission.homeworkId.classId.toString()) {
    throw new Error("You can only view submissions for your class homework");
  }
  
  return submission;
};

// Lấy thông tin homeworkID và submission của student
const getSubmissionByHomeworkIdForStudent = async (homeworkId, studentId) => {
 
  const homework = await Homework.findById(homeworkId).populate(
    "classId",
    "name code"
  );
  
  if (!homework) throw new Error("Homework not found");
  
  // Lấy thông tin student để kiểm tra lớp
  const User = require("../models/user.model");
  const student = await User.findById(studentId).select("currentClass");
  
  if (!student) throw new Error("Student not found");
  

  if (student.currentClass.toString() !== homework.classId._id.toString()) {
    throw new Error("You can only view homework from your class");
  }
  
  const submission = await Submission.findOne({
    homeworkId: homeworkId,
    studentId: studentId
  });
  
  return {
    homework,
    submission
  };
};

// Lấy tất cả submissions của homeworkID cho teacher
const getSubmissionsByHomeworkIdForTeacher = async (homeworkId, teacherId) => {

  const homework = await Homework.findById(homeworkId).populate(
    "classId",
    "name code"
  );
  
  if (!homework) throw new Error("Homework not found");
  
  if (homework.teacherId.toString() !== teacherId.toString()) {
    throw new Error("You can only view submissions for your own homework");
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
  getSubmissionByHomeworkIdForStudent,
  getSubmissionsByHomeworkIdForTeacher
};
