const Homework = require('../models/homework.model');
const HomeworkSubmission = require('../models/homework_submission.model');
const User = require('../models/user.model');
const Class = require('../models/class.model');

// Create homework assignment
const createHomework = async (payload) => {
  const {
    title,
    description,
    instructions = '',
    class: classId,
    dueDate,
    allowLateSubmission = false,
    maxAttempts = 1,
    attachments = []
  } = payload;

  // Get teacher from payload
  const { teacher } = payload;

  // Validate teacher
  const teacherDoc = await User.findById(teacher);
  if (!teacherDoc) throw new Error('Teacher not found');
  if (teacherDoc.role !== 'teacher') throw new Error('User is not a teacher');

  // Validate class
  const classDoc = await Class.findById(classId);
  if (!classDoc) throw new Error('Class not found');

  // Check if teacher is authorized for this class
  if (classDoc.homeroomTeacher.toString() !== teacher) {
    throw new Error('Teacher is not authorized for this class');
  }

  // Validate due date
  if (new Date(dueDate) <= new Date()) {
    throw new Error('Due date must be in the future');
  }

  const homework = await Homework.create({
    title,
    description,
    instructions,
    class: classId,
    teacher,
    dueDate: new Date(dueDate),
    allowLateSubmission,
    maxAttempts,
    attachments
  });

  return await homework.populate('teacher', 'firstName lastName email');
};

// Get homework by ID
const getHomeworkById = async (homeworkId) => {
  const homework = await Homework.findById(homeworkId)
    .populate('teacher', 'firstName lastName email')
    .populate('class', 'name code');
  
  if (!homework) throw new Error('Homework not found');
  return homework;
};

// List homeworks with filters
const listHomeworks = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    class: classId,
    teacher,
    status = 'published',
    type,
    search,
    sortBy = 'dueDate',
    sortOrder = 'asc'
  } = filters;

  const query = {};

  if (classId) query.class = classId;
  if (teacher) query.teacher = teacher;
  if (status) query.status = status;
  if (type) query.type = type;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const homeworks = await Homework.find(query)
    .populate('teacher', 'firstName lastName email')
    .populate('class', 'name code')
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
const updateHomework = async (homeworkId, updateData, teacherId) => {
  const homework = await Homework.findById(homeworkId);
  if (!homework) throw new Error('Homework not found');

  // Check if teacher is authorized
  if (homework.teacher.toString() !== teacherId) {
    throw new Error('Not authorized to update this homework');
  }

  // Don't allow updating if homework is closed
  if (homework.status === 'closed') {
    throw new Error('Cannot update closed homework');
  }

  // Validate due date if being updated
  if (updateData.dueDate && new Date(updateData.dueDate) <= new Date()) {
    throw new Error('Due date must be in the future');
  }

  const updatedHomework = await Homework.findByIdAndUpdate(
    homeworkId,
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate('teacher', 'firstName lastName email')
   .populate('class', 'name code');

  return updatedHomework;
};

// Delete homework
const deleteHomework = async (homeworkId, teacherId) => {
  const homework = await Homework.findById(homeworkId);
  if (!homework) throw new Error('Homework not found');

  // Check if teacher is authorized
  if (homework.teacher.toString() !== teacherId) {
    throw new Error('Not authorized to delete this homework');
  }

  // Check if there are any submissions
  const submissionCount = await HomeworkSubmission.countDocuments({ homework: homeworkId });
  if (submissionCount > 0) {
    throw new Error('Cannot delete homework with existing submissions');
  }

  await Homework.findByIdAndDelete(homeworkId);
  return { message: 'Homework deleted successfully' };
};

// Publish homework
const publishHomework = async (homeworkId, teacherId) => {
  const homework = await Homework.findById(homeworkId);
  if (!homework) throw new Error('Homework not found');

  if (homework.teacher.toString() !== teacherId) {
    throw new Error('Not authorized to publish this homework');
  }

  if (homework.status === 'published') {
    throw new Error('Homework is already published');
  }

  homework.status = 'published';
  await homework.save();

  return await homework.populate('teacher', 'firstName lastName email')
    .populate('class', 'name code');
};

// Close homework
const closeHomework = async (homeworkId, teacherId) => {
  const homework = await Homework.findById(homeworkId);
  if (!homework) throw new Error('Homework not found');

  if (homework.teacher.toString() !== teacherId) {
    throw new Error('Not authorized to close this homework');
  }

  homework.status = 'closed';
  await homework.save();

  return await homework.populate('teacher', 'firstName lastName email')
    .populate('class', 'name code');
};

// Submit homework
const submitHomework = async (payload) => {
  const {
    homeworkId,
    studentId,
    content = '',
    attachments = [],
    notes = ''
  } = payload;

  // Validate homework exists and is published
  const homework = await Homework.findById(homeworkId);
  if (!homework) throw new Error('Homework not found');
  if (homework.status !== 'published') {
    throw new Error('Homework is not available for submission');
  }

  // Validate student
  const student = await User.findById(studentId);
  if (!student) throw new Error('Student not found');
  if (student.role !== 'student') throw new Error('User is not a student');

  // Check if student is enrolled in the class
  const classDoc = await Class.findById(homework.class);
  if (!classDoc.students.includes(studentId)) {
    throw new Error('Student is not enrolled in this class');
  }

  // Check if due date has passed
  const now = new Date();
  const isLate = now > homework.dueDate;
  
  if (isLate && !homework.allowLateSubmission) {
    throw new Error('Submission deadline has passed');
  }

  // Check existing submission
  let submission = await HomeworkSubmission.findOne({
    homework: homeworkId,
    student: studentId
  });

  if (submission) {
    // Check if resubmission is allowed
    if (submission.attemptNumber >= homework.maxAttempts) {
      throw new Error('Maximum submission attempts exceeded');
    }

    // Update existing submission
    submission.content = content;
    submission.attachments = attachments;
    submission.notes = notes;
    submission.status = 'submitted';
    submission.submittedAt = now;
    submission.isLate = isLate;
    submission.attemptNumber += 1;
    submission.latePenalty = isLate ? homework.latePenalty : 0;
    submission.maxScore = homework.points;

    await submission.save();
  } else {
    // Create new submission
    submission = await HomeworkSubmission.create({
      homework: homeworkId,
      student: studentId,
      class: homework.class,
      content,
      attachments,
      notes,
      status: 'submitted',
      submittedAt: now,
      isLate,
      maxScore: homework.points,
      latePenalty: isLate ? homework.latePenalty : 0
    });
  }

  // Update homework statistics
  await updateHomeworkStats(homeworkId);

  return await submission.populate('homework', 'title dueDate points type')
    .populate('student', 'firstName lastName email');
};

// Grade homework submission
const gradeSubmission = async (submissionId, gradeData, teacherId) => {
  const { score, feedback = '', grade = null } = gradeData;

  const submission = await HomeworkSubmission.findById(submissionId)
    .populate('homework', 'teacher points gradingType');
  
  if (!submission) throw new Error('Submission not found');

  // Check if teacher is authorized
  if (submission.homework.teacher.toString() !== teacherId) {
    throw new Error('Not authorized to grade this submission');
  }

  // Validate score
  if (score < 0 || score > submission.maxScore) {
    throw new Error(`Score must be between 0 and ${submission.maxScore}`);
  }

  submission.score = score;
  submission.feedback = feedback;
  submission.grade = grade;
  submission.status = 'graded';
  submission.gradedBy = teacherId;
  submission.gradedAt = new Date();

  await submission.save();

  // Update homework statistics
  await updateHomeworkStats(submission.homework._id);

  return await submission.populate('student', 'firstName lastName email')
    .populate('gradedBy', 'firstName lastName');
};

// Get submissions for a homework
const getHomeworkSubmissions = async (homeworkId, teacherId) => {
  const homework = await Homework.findById(homeworkId);
  if (!homework) throw new Error('Homework not found');

  if (homework.teacher.toString() !== teacherId) {
    throw new Error('Not authorized to view submissions');
  }

  const submissions = await HomeworkSubmission.find({ homework: homeworkId })
    .populate('student', 'firstName lastName email')
    .sort({ submittedAt: -1 });

  return submissions;
};

// Get student's submissions
const getStudentSubmissions = async (studentId, classId = null) => {
  const query = { student: studentId };
  if (classId) query.class = classId;

  const submissions = await HomeworkSubmission.find(query)
    .populate('homework', 'title dueDate points type status')
    .populate('gradedBy', 'firstName lastName')
    .sort({ submittedAt: -1 });

  return submissions;
};

// Update homework statistics
const updateHomeworkStats = async (homeworkId) => {
  const homework = await Homework.findById(homeworkId);
  if (!homework) return;

  const submissions = await HomeworkSubmission.find({ 
    homework: homeworkId, 
    status: { $in: ['submitted', 'graded', 'returned'] } 
  });

  homework.totalSubmissions = submissions.length;

  if (submissions.length > 0) {
    const gradedSubmissions = submissions.filter(s => s.score !== null);
    if (gradedSubmissions.length > 0) {
      const totalScore = gradedSubmissions.reduce((sum, s) => sum + s.score, 0);
      homework.averageScore = Math.round(totalScore / gradedSubmissions.length);
    }
  }

  await homework.save();
};

// Get homework analytics
const getHomeworkAnalytics = async (homeworkId, teacherId) => {
  const homework = await Homework.findById(homeworkId);
  if (!homework) throw new Error('Homework not found');

  if (homework.teacher.toString() !== teacherId) {
    throw new Error('Not authorized to view analytics');
  }

  const submissions = await HomeworkSubmission.find({ homework: homeworkId });
  const totalStudents = await Class.findById(homework.class).then(c => c.students.length);

  const analytics = {
    totalStudents,
    totalSubmissions: submissions.length,
    submissionRate: totalStudents > 0 ? Math.round((submissions.length / totalStudents) * 100) : 0,
    gradedSubmissions: submissions.filter(s => s.status === 'graded').length,
    lateSubmissions: submissions.filter(s => s.isLate).length,
    averageScore: homework.averageScore,
    scoreDistribution: {
      A: submissions.filter(s => s.percentage >= 90).length,
      B: submissions.filter(s => s.percentage >= 80 && s.percentage < 90).length,
      C: submissions.filter(s => s.percentage >= 70 && s.percentage < 80).length,
      D: submissions.filter(s => s.percentage >= 60 && s.percentage < 70).length,
      F: submissions.filter(s => s.percentage < 60).length
    }
  };

  return analytics;
};

module.exports = {
  createHomework,
  getHomeworkById,
  listHomeworks,
  updateHomework,
  deleteHomework,
  publishHomework,
  closeHomework,
  submitHomework,
  gradeSubmission,
  getHomeworkSubmissions,
  getStudentSubmissions,
  getHomeworkAnalytics
};
