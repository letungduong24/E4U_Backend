const submissionService = require('../services/submission.service');

// @desc    Create submission
// @route   POST /api/submissions
// @access  Student only
const createSubmission = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'student') {
      return res.status(403).json({ status: 'fail', message: 'Truy cập bị từ chối - Chỉ học sinh mới có thể nộp bài' });
    }
    
    const submission = await submissionService.createSubmission({
      homeworkId: req.body.homeworkId,
      studentId: user._id,
      file: req.file ? req.file.path : req.body.file || null
    });
    
    res.status(201).json({
      status: 'success',
      data: { submission }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update submission
// @route   PUT /api/submissions/:id
// @access  Student only (owner)
const updateSubmission = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'student') {
      return res.status(403).json({ status: 'fail', message: 'Truy cập bị từ chối - Chỉ học sinh mới có thể cập nhật bài nộp' });
    }
    
    const submission = await submissionService.updateSubmission(
      req.params.id,
      user._id, // Truyền studentId để kiểm tra ownership
      {
        file: req.file ? req.file.path : req.body.file || undefined
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: { submission }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Grade submission
// @route   POST /api/submissions/:id/grade
// @access  Teacher
const gradeSubmission = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'teacher') {
      return res.status(403).json({ status: 'fail', message: 'Truy cập bị từ chối' });
    }
    
    const submission = await submissionService.gradeSubmission(
      req.params.id,
      user._id,
      {
        grade: req.body.grade,
        feedback: req.body.feedback
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: { submission }
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get student submissions
// @route   GET /api/submissions/student
// @access  Student only (own submissions)
const getStudentSubmissions = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'student') {
      return res.status(403).json({ status: 'fail', message: 'Truy cập bị từ chối - Chỉ học sinh mới có thể xem bài nộp của mình' });
    }
    
    const { status } = req.query;
    const submissions = await submissionService.getStudentSubmissions(user._id, {
      status
    });
    
    res.status(200).json({
      status: 'success',
      data: { submissions }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get graded submissions for student
// @route   GET /api/submissions/student/graded
// @access  Student only (own graded submissions)
const getGradedSubmissionsForStudent = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'student') {
      return res.status(403).json({ status: 'fail', message: 'Truy cập bị từ chối - Chỉ học sinh mới có thể xem bài đã chấm điểm' });
    }
    
    const submissions = await submissionService.getGradedSubmissionsForStudent(user._id);
    
    res.status(200).json({
      status: 'success',
      data: { submissions }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Student, Teacher
const getSubmissionById = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Kiểm tra role - chỉ student và teacher được phép
    if (user.role !== 'student' && user.role !== 'teacher') {
      return res.status(403).json({ status: 'fail', message: 'Truy cập bị từ chối - Chỉ học sinh và giáo viên mới có thể xem bài nộp' });
    }
    
    // Truyền studentId nếu user là student để kiểm tra ownership trong service
    const studentId = user.role === 'student' ? user._id : null;
    const submission = await submissionService.getSubmissionById(req.params.id, studentId);
    
    res.status(200).json({
      status: 'success',
      data: { submission }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get homework and submission by homework ID for student
// @route   GET /api/submissions/homework/:homeworkId/student
// @access  Student only (own submission)
const getSubmissionByHomeworkIdForStudent = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'student') {
      return res.status(403).json({ status: 'fail', message: 'Truy cập bị từ chối - Chỉ học sinh mới có thể xem bài nộp bài tập' });
    }
    
    const { homeworkId } = req.params;
    const result = await submissionService.getSubmissionByHomeworkIdForStudent(homeworkId, user._id);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all submissions by homework ID for teacher
// @route   GET /api/submissions/homework/:homeworkId/teacher
// @access  Teacher only (own homework)
const getSubmissionsByHomeworkIdForTeacher = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'teacher') {
      return res.status(403).json({ status: 'fail', message: 'Truy cập bị từ chối - Chỉ giáo viên mới có thể xem tất cả bài nộp' });
    }
    
    const { homeworkId } = req.params;
    const result = await submissionService.getSubmissionsByHomeworkIdForTeacher(homeworkId, user._id);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Student only (owner)
const deleteSubmission = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'student') {
      return res.status(403).json({ status: 'fail', message: 'Truy cập bị từ chối - Chỉ học sinh mới có thể xóa bài nộp' });
    }
    
    const result = await submissionService.deleteSubmission(req.params.id, user._id);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubmission,
  updateSubmission,
  gradeSubmission,
  getStudentSubmissions,
  getGradedSubmissionsForStudent,
  getSubmissionById,
  getSubmissionByHomeworkIdForStudent,
  getSubmissionsByHomeworkIdForTeacher,
  deleteSubmission
};
