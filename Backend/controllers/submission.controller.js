const submissionService = require('../services/submission.service');

// @desc    Create submission
// @route   POST /api/submissions
// @access  Student
const createSubmission = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'student') {
      return res.status(403).json({ status: 'fail', message: 'Access denied' });
    }
    
    const submission = await submissionService.createSubmission({
      homeworkId: req.body.homeworkId,
      studentId: user._id,
      file: req.file ? {
        fileName: req.file.originalname,
        filePath: req.file.path
      } : null
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
// @access  Student
const updateSubmission = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'student') {
      return res.status(403).json({ status: 'fail', message: 'Access denied' });
    }
    
    const submission = await submissionService.updateSubmission(
      req.params.id,
      {
        file: req.file ? {
          fileName: req.file.originalname,
          filePath: req.file.path
        } : undefined
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
      return res.status(403).json({ status: 'fail', message: 'Access denied' });
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

// @desc    Get submission status by homework
// @route   GET /api/submissions/homework/:homeworkId/status
// @access  Teacher
const getSubmissionStatusByHomework = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'teacher') {
      return res.status(403).json({ status: 'fail', message: 'Access denied' });
    }
    
    const status = await submissionService.getSubmissionStatusByHomework(req.params.homeworkId);
    
    res.status(200).json({
      status: 'success',
      data: status
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student submissions
// @route   GET /api/submissions/student
// @access  Student
const getStudentSubmissions = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'student') {
      return res.status(403).json({ status: 'fail', message: 'Access denied' });
    }
    
    const { page, limit, status } = req.query;
    const result = await submissionService.getStudentSubmissions(user._id, {
      page,
      limit,
      status
    });
    
    res.status(200).json({
      status: 'success',
      data: result
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
    const submission = await submissionService.getSubmissionById(req.params.id);
    
    // Kiểm tra quyền truy cập
    if (user.role === 'student' && submission.studentId._id.toString() !== user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'Access denied' });
    }
    
    res.status(200).json({
      status: 'success',
      data: { submission }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubmission,
  updateSubmission,
  gradeSubmission,
  getSubmissionStatusByHomework,
  getStudentSubmissions,
  getSubmissionById
};
