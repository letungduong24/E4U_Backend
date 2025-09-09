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
    submittedAt: new Date(),
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
    { 
      ...updateData, 
      submittedAt: new Date(),
      updatedAt: new Date() 
    },
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

// Lấy danh sách học sinh đã nộp và chưa nộp bài tập
const getSubmissionStatusByHomework = async (homeworkId) => {

  const homework = await Homework.findById(homeworkId).populate("classId", "name code");
  if (!homework) {
    throw new Error("Homework not found");
  }

  const students = await User.find({
    currentClass: homework.classId._id,
    role: "student",
  }).select("_id name email");
  
  
  const submissions = await Submission.find({ homeworkId }).populate("studentId", "name email");
  
 
  const submissionMap = new Map();
  submissions.forEach((sub) => {
    submissionMap.set(sub.studentId._id.toString(), sub);
  });
  
  // Phân loại học sinh
  const submittedStudents = [];
  const notSubmittedStudents = [];
  
  students.forEach((student) => {
    const submission = submissionMap.get(student._id.toString());
    
    if (submission) {

      submittedStudents.push({
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
        },
        submission: {
          _id: submission._id,
          file: submission.file,
          submittedAt: submission.submittedAt,
          status: submission.status,
          grade: submission.grade,
          feedback: submission.feedback,
          gradedAt: submission.gradedAt,
        },
      });
    } else {
 
      notSubmittedStudents.push({
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
        },
        submission: null,
      });
    }
  });
  
  return {
    homework: {
      _id: homework._id,
      description: homework.description,
      deadline: homework.deadline,
      class: homework.classId,
    },
    statistics: {
      totalStudents: students.length,
      submittedCount: submittedStudents.length,
      notSubmittedCount: notSubmittedStudents.length,
      submissionRate: students.length > 0 
        ? Math.round((submittedStudents.length / students.length) * 100) 
        : 0,
    },
    submittedStudents,
    notSubmittedStudents,
  };
};


const getStudentSubmissions = async (studentId, { page = 1, limit = 10, status }) => {
  const query = { studentId };
  if (status) query.status = status;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const [submissions, total] = await Promise.all([
    Submission.find(query)
      .populate("homeworkId", "description deadline classId")
      .skip(skip)
      .limit(Number(limit))
      .sort({ submittedAt: -1 }),
    Submission.countDocuments(query)
  ]);
  
  return {
    submissions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)) || 1
    }
  };
};


const getSubmissionById = async (submissionId) => {
  const submission = await Submission.findById(submissionId);
  
  if (!submission) throw new Error("Submission not found");
  
  await submission.populate("studentId", "name email");
  await submission.populate("homeworkId", "description deadline classId");
  return submission;
};

module.exports = {
  createSubmission,
  updateSubmission,
  gradeSubmission,
  getSubmissionStatusByHomework,
  getStudentSubmissions,
  getSubmissionById
};
