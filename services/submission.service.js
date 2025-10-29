const Submission = require("../models/submission.model");
const Homework = require("../models/homework.model");
const User = require("../models/user.model");

// Nộp bài tập
const createSubmission = async (payload) => {
  const { homeworkId, studentId, file } = payload;
  
  // Lấy thông tin homework
  const homework = await Homework.findById(homeworkId).populate("classId", "name code");
  if (!homework) throw new Error("Không tìm thấy bài tập");
  
  // Lấy thông tin student
  const student = await User.findById(studentId).select("currentClass");
  if (!student) throw new Error("Không tìm thấy học sinh");
  
  // Kiểm tra student có thuộc lớp của homework không
  if (student.currentClass.toString() !== homework.classId._id.toString()) {
    throw new Error("Bạn chỉ có thể nộp bài tập của lớp mình");
  }
  
  // Kiểm tra đã nộp bài chưa
  const existingSubmission = await Submission.findOne({
    homeworkId,
    studentId,
  });
  if (existingSubmission) {
    throw new Error("Bạn đã nộp bài tập này rồi");
  }

  // Kiểm tra deadline
  if (new Date() > new Date(homework.deadline)) {
    throw new Error("Đã quá hạn nộp bài");
  }
  
  const submission = await Submission.create({
    homeworkId,
    studentId,
    file,
  });
  
  await submission.populate("studentId", "firstName lastName email");
  await submission.populate("homeworkId", "title description deadline classId");
  return submission;
};

// Sửa bài (khi chưa quá hạn và chưa chấm điểm)
const updateSubmission = async (submissionId, studentId, updateData) => {
  const submission = await Submission.findById(submissionId);

  if (!submission) throw new Error("Không tìm thấy bài nộp");

  // Kiểm tra ownership
  if (submission.studentId.toString() !== studentId.toString()) {
    throw new Error("Bạn chỉ có thể sửa bài nộp của chính mình");
  }

  // Lấy thông tin homework
  const homework = await Homework.findById(submission.homeworkId).populate("classId", "name code");
  if (!homework) throw new Error("Không tìm thấy bài tập");

  if (submission.status === "graded") {
    throw new Error("Không thể sửa bài đã được chấm");
  }

  if (new Date() > new Date(homework.deadline)) {
    throw new Error("Không thể sửa bài sau khi đã quá hạn");
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
  if (!submission) throw new Error("Không tìm thấy bài nộp");
  
  
  if (String(submission.homeworkId.teacherId) !== String(teacherId)) {
    throw new Error("Bạn không có quyền chấm bài nộp này");
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
  
  if (!submission) throw new Error("Không tìm thấy bài nộp");
  

  if (studentId && submission.studentId.toString() !== studentId.toString()) {
    throw new Error("Bạn chỉ có thể xem bài nộp của chính mình");
  }
  
  await submission.populate("studentId", "name email currentClass");
  await submission.populate("homeworkId", "description deadline classId");
  
  // Kiểm tra student có thuộc lớp của homework không (nếu là student)
  if (studentId && submission.studentId.currentClass.toString() !== submission.homeworkId.classId.toString()) {
    throw new Error("Bạn chỉ có thể xem bài nộp của lớp mình");
  }
  
  return submission;
};

// Lấy thông tin homeworkID và submission của student
const getSubmissionByHomeworkIdForStudent = async (homeworkId, studentId) => {
 
  const homework = await Homework.findById(homeworkId).populate(
    "classId",
    "name code"
  );
  
  if (!homework) throw new Error("Không tìm thấy bài tập");
  
  // Lấy thông tin student để kiểm tra lớp
  const User = require("../models/user.model");
  const student = await User.findById(studentId).select("currentClass");
  
  if (!student) throw new Error("Không tìm thấy học sinh");
  

  if (student.currentClass.toString() !== homework.classId._id.toString()) {
    throw new Error("Bạn chỉ có thể xem bài tập của lớp mình");
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
  
  if (!homework) throw new Error("Không tìm thấy bài tập");
  
  if (homework.teacherId.toString() !== teacherId.toString()) {
    throw new Error("Bạn chỉ có thể xem bài nộp của bài tập do mình tạo");
  }
  
  const submissions = await Submission.find({ homeworkId })
    .populate("studentId", "name email")
    .sort({ createdAt: -1 });
  
  return {
    homework,
    submissions
  };
};

// Xóa submission (chỉ được xóa khi chưa hết hạn HOẶC đã được chấm)
const deleteSubmission = async (submissionId, studentId) => {
  const submission = await Submission.findById(submissionId).populate("homeworkId");

  if (!submission) throw new Error("Không tìm thấy bài nộp");

  // Kiểm tra ownership
  if (submission.studentId.toString() !== studentId.toString()) {
    throw new Error("Bạn chỉ có thể xóa bài nộp của chính mình");
  }

  const homework = submission.homeworkId;

  // Điều kiện xóa: chưa hết hạn HOẶC đã được chấm
  const isDeadlinePassed = new Date() > new Date(homework.deadline);
  const isGraded = submission.status === "graded";
  
  if (!isDeadlinePassed || isGraded) {
    // Có thể xóa (chưa hết hạn HOẶC đã được chấm)
  } else {
    // Không được xóa (đã hết hạn VÀ chưa được chấm)
    throw new Error("Không thể xóa bài nộp đã quá hạn và chưa được chấm điểm");
  }
  
  await Submission.findByIdAndDelete(submissionId);
  
  return { message: "Xóa bài nộp thành công" };
};

module.exports = {
  createSubmission,
  updateSubmission,
  gradeSubmission,
  getStudentSubmissions,
  getSubmissionById,
  getSubmissionByHomeworkIdForStudent,
  getSubmissionsByHomeworkIdForTeacher,
  deleteSubmission
};
