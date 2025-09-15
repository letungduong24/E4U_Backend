const homeworkService = require('../services/homework.service');

// @desc    Create homework assignment
// @route   POST /api/homeworks
// @access  Teacher
const createHomework = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'teacher') {
      return res.status(403).json({ status: 'fail', message: 'Access denied' });
    } 
    const homework = await homeworkService.createHomework({...req.body, teacherId: user._id, classId: user.teachingClass });
    res.status(201).json({ 
      status: 'success', 
      data: { homework } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get homework by ID
// @route   GET /api/homeworks/:id/homeworkid
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

// @desc    Get homework by CLassId
// @route   GET /api/homeworks/:id/classid
// @access  Teacher, Student (if enrolled)
const getHomeworkByClassId = async (req, res, next) => {
  try {
    const homework = await homeworkService.getHomeworkByClassId(req.params.id);
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
      ...(req.user.role === 'teacher' ? { teacherId: req.user._id } : {}),
      ...(req.user.role === 'student' ? { classId: req.user.currentClass } : {})
    };
    
    const result = await homeworkService.listHomeworks(filters);
    res.status(200).json({ 
      status: 'success', 
      data: result,
      role: req.user.role
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update homework
// @route   PUT /api/homeworks/:id
// @access  Teacher
const updateHomework = async (req, res, next) => {
  try {
    const homework = await homeworkService.updateHomework(
      req.params.id, 
      req.body
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
// @access  Teacher
const deleteHomework = async (req, res, next) => {
  try {
    const result = await homeworkService.deleteHomework(req.params.id);
    res.status(200).json({ 
      status: 'success', 
      message: result.message 
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
    const assignments = await homeworkService.listHomeworks({
      classId: req.user.currentClass,
      sortBy: 'deadline',
      sortOrder: 'asc',
      limit: 4
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
      classId: req.user.currentClass,
      deadline: { $lt: now },
      sortBy: 'deadline',
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
  getUpcomingAssignments,
  getOverdueAssignments,
  getHomeworkByClassId
};
