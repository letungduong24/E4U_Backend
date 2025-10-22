const adminService = require('../services/admin.service');
const classService = require('../services/class.service');

// @desc    List users (admin)
// @route   GET /api/admin/users
// @access  Admin
const listUsers = async (req, res, next) => {
  try {
    const { role, classId, q } = req.query;
    const users = await adminService.listUsers({
      role,
      classId,
      q
    });
    res.status(200).json({ status: 'success', data: { users } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user (admin)
// @route   POST /api/admin/users
// @access  Admin
const createUser = async (req, res, next) => {
  try {
    const user = await adminService.createUser(req.body);
    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by id (admin)
// @route   GET /api/admin/users/:id
// @access  Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user by admin
// @route   PUT /api/admin/users/:id
// @access  Admin
const updateUserByAdmin = async (req, res, next) => {
  try {
    const user = await adminService.updateUserByAdmin(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
  try {
    const result = await adminService.deleteUser(req.params.id);
    res.status(200).json({ status: 'success', message: result.message });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate/Deactivate user
// @route   PATCH /api/admin/users/:id/active
// @access  Admin
const setUserActiveStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await adminService.setUserActiveStatus(req.params.id, Boolean(isActive));
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

// @desc    Set teaching class for teacher
// @route   POST /api/admin/teachers/:id/class
// @access  Admin
const setTeacherClass = async (req, res, next) => {
  try {
    const { classId } = req.body;
    const teacher = await adminService.setTeacherClass(req.params.id, classId);
    res.status(200).json({
      status: 'success',
      message: 'Teacher assigned to class successfully',
      data: { teacher }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove teacher from class
// @route   DELETE /api/admin/teachers/:id/class
// @access  Admin
const removeTeacherFromClass = async (req, res, next) => {
  try {
    const teacher = await adminService.removeTeacherFromClass(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Teacher removed from class successfully',
      data: { teacher }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unassigned teachers
// @route   GET /api/admin/teachers/unassigned
// @access  Admin
const getUnassignedTeachers = async (req, res, next) => {
  try {
    const teachers = await adminService.getUnassignedTeachers();
    res.status(200).json({
      status: 'success',
      data: { teachers }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get classes without teachers
// @route   GET /api/admin/classes/without-teacher
// @access  Admin
const getClassesWithoutTeacher = async (req, res, next) => {
  try {
    const classes = await adminService.getClassesWithoutTeacher();
    res.status(200).json({
      status: 'success',
      data: { classes }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List classes (admin)
// @route   GET /api/admin/classes
// @access  Admin
const listClasses = async (req, res, next) => {
  try {
    const { teacher, q } = req.query;
    const classes = await classService.listClasses({ teacher, q });
    res.status(200).json({ status: 'success', data: { classes } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get class by id (admin)
// @route   GET /api/admin/classes/:id
// @access  Admin
const getClassById = async (req, res, next) => {
  try {
    const cls = await classService.getClassById(req.params.id);
    res.status(200).json({ status: 'success', data: { class: cls } });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer student to new class (admin)
// @route   POST /api/admin/students/:studentId/transfer
// @access  Admin
const transferStudent = async (req, res, next) => {
  try {
    const { newClassId, notes } = req.body;
    const result = await studentClassService.transferStudent(req.params.studentId, newClassId, notes);
    res.status(200).json({
      status: 'success',
      message: 'Student transferred successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll student in class (admin)
// @route   POST /api/admin/students/:studentId/enroll
// @access  Admin
const enrollStudent = async (req, res, next) => {
  try {
    const enrollment = await studentClassService.enrollStudent({
      student: req.params.studentId,
      ...req.body
    });
    res.status(201).json({
      status: 'success',
      message: 'Student enrolled successfully',
      data: { enrollment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student enrollment history (admin)
// @route   GET /api/admin/students/:studentId/history
// @access  Admin
const getStudentHistory = async (req, res, next) => {
  try {
    const history = await studentClassService.getStudentHistory(req.params.studentId);
    res.status(200).json({
      status: 'success',
      data: { history }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  createUser,
  getUserById,
  updateUserByAdmin,
  deleteUser,
  setUserActiveStatus,
  // Teacher class management
  setTeacherClass,
  removeTeacherFromClass,
  getUnassignedTeachers,
  getClassesWithoutTeacher,
  // Class management
  listClasses,
  getClassById,
  // Student enrollment management
  transferStudent,
  enrollStudent,
  getStudentHistory
};


