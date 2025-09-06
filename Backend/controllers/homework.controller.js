const homeworkService = require('../services/homework.service');

// @desc    Create homework assignment
// @route   POST /api/homeworks
// @access  Teacher
const createHomework = async (req, res, next) => {
  try {
    const homework = await homeworkService.createHomework({
      ...req.body,
      teacher: req.user.id
    });
    res.status(201).json({ 
      status: 'success', 
      data: { homework } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get homework by ID
// @route   GET /api/homeworks/:id
// @access  Teacher, Student (if enrolled)
const getHomeworkById = async (req, res, next) => {
  try {
    const homework = await homeworkService.getHomeworkById(req.params.id);
    res.status(200).json({ 
      status: 'success', 
      data: { homework } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List homeworks
// @route   GET /api/homeworks
// @access  Teacher, Student
const listHomeworks = async (req, res, next) => {
  try {
    const filters = {
      ...req.query,
      // Add role-based filtering
      ...(req.user.role === 'teacher' ? { teacher: req.user.id } : {}),
      ...(req.user.role === 'student' ? { class: req.user.currentClass } : {})
    };
    
    const result = await homeworkService.listHomeworks(filters);
    res.status(200).json({ 
      status: 'success', 
      data: result 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update homework
// @route   PUT /api/homeworks/:id
// @access  Teacher (owner only)
const updateHomework = async (req, res, next) => {
  try {
    const homework = await homeworkService.updateHomework(
      req.params.id, 
      req.body, 
      req.user.id
    );
    res.status(200).json({ 
      status: 'success', 
      data: { homework } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete homework
// @route   DELETE /api/homeworks/:id
// @access  Teacher (owner only)
const deleteHomework = async (req, res, next) => {
  try {
    const result = await homeworkService.deleteHomework(req.params.id, req.user.id);
    res.status(200).json({ 
      status: 'success', 
      message: result.message 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish homework
// @route   PATCH /api/homeworks/:id/publish
// @access  Teacher (owner only)
const publishHomework = async (req, res, next) => {
  try {
    const homework = await homeworkService.publishHomework(req.params.id, req.user.id);
    res.status(200).json({ 
      status: 'success', 
      data: { homework } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close homework
// @route   PATCH /api/homeworks/:id/close
// @access  Teacher (owner only)
const closeHomework = async (req, res, next) => {
  try {
    const homework = await homeworkService.closeHomework(req.params.id, req.user.id);
    res.status(200).json({ 
      status: 'success', 
      data: { homework } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit homework
// @route   POST /api/homeworks/:id/submit
// @access  Student
const submitHomework = async (req, res, next) => {
  try {
    const submission = await homeworkService.submitHomework({
      homeworkId: req.params.id,
      studentId: req.user.id,
      ...req.body
    });
    res.status(201).json({ 
      status: 'success', 
      data: { submission } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Grade homework submission
// @route   PATCH /api/homeworks/submissions/:submissionId/grade
// @access  Teacher
const gradeSubmission = async (req, res, next) => {
  try {
    const submission = await homeworkService.gradeSubmission(
      req.params.submissionId,
      req.body,
      req.user.id
    );
    res.status(200).json({ 
      status: 'success', 
      data: { submission } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get homework submissions
// @route   GET /api/homeworks/:id/submissions
// @access  Teacher (owner only)
const getHomeworkSubmissions = async (req, res, next) => {
  try {
    const submissions = await homeworkService.getHomeworkSubmissions(
      req.params.id, 
      req.user.id
    );
    res.status(200).json({ 
      status: 'success', 
      data: { submissions } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student submissions
// @route   GET /api/homeworks/submissions/student
// @access  Student
const getStudentSubmissions = async (req, res, next) => {
  try {
    const submissions = await homeworkService.getStudentSubmissions(
      req.user.id,
      req.query.classId
    );
    res.status(200).json({ 
      status: 'success', 
      data: { submissions } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get homework analytics
// @route   GET /api/homeworks/:id/analytics
// @access  Teacher (owner only)
const getHomeworkAnalytics = async (req, res, next) => {
  try {
    const analytics = await homeworkService.getHomeworkAnalytics(
      req.params.id, 
      req.user.id
    );
    res.status(200).json({ 
      status: 'success', 
      data: { analytics } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming assignments
// @route   GET /api/homeworks/upcoming
// @access  Student
const getUpcomingAssignments = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const assignments = await homeworkService.listHomeworks({
      class: req.user.currentClass,
      status: 'published',
      sortBy: 'dueDate',
      sortOrder: 'asc',
      limit: 10
    });
    
    res.status(200).json({ 
      status: 'success', 
      data: assignments 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overdue assignments
// @route   GET /api/homeworks/overdue
// @access  Student
const getOverdueAssignments = async (req, res, next) => {
  try {
    const now = new Date();
    const assignments = await homeworkService.listHomeworks({
      class: req.user.currentClass,
      status: 'published',
      dueDate: { $lt: now },
      sortBy: 'dueDate',
      sortOrder: 'desc',
      limit: 10
    });
    
    res.status(200).json({ 
      status: 'success', 
      data: assignments 
    });
  } catch (error) {
    next(error);
  }
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
  getHomeworkAnalytics,
  getUpcomingAssignments,
  getOverdueAssignments
};
