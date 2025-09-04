const adminService = require('./admin.service');

// @desc    List users (admin)
// @route   GET /api/admin/users
// @access  Admin
const listUsers = async (req, res, next) => {
  try {
    const { page, limit, role, isActive } = req.query;
    const result = await adminService.listUsers({
      page,
      limit,
      role,
      isActive: typeof isActive === 'string' ? isActive === 'true' : undefined
    });
    res.status(200).json({ status: 'success', data: result });
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

// @desc    Create class
// @route   POST /api/admin/classes
// @access  Admin
const createClass = async (req, res, next) => {
  try {
    const cls = await adminService.createClass(req.body);
    res.status(201).json({ status: 'success', data: { class: cls } });
  } catch (error) {
    next(error);
  }
};

// @desc    List classes
// @route   GET /api/admin/classes
// @access  Admin
const listClasses = async (req, res, next) => {
  try {
    const { page, limit, teacher, q } = req.query;
    const result = await adminService.listClasses({ page, limit, teacher, q });
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get class by id
// @route   GET /api/admin/classes/:id
// @access  Admin
const getClassById = async (req, res, next) => {
  try {
    const cls = await adminService.getClassById(req.params.id);
    res.status(200).json({ status: 'success', data: { class: cls } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update class
// @route   PUT /api/admin/classes/:id
// @access  Admin
const updateClass = async (req, res, next) => {
  try {
    const cls = await adminService.updateClass(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: { class: cls } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete class
// @route   DELETE /api/admin/classes/:id
// @access  Admin
const deleteClass = async (req, res, next) => {
  try {
    const result = await adminService.deleteClass(req.params.id);
    res.status(200).json({ status: 'success', message: result.message });
  } catch (error) {
    next(error);
  }
};

// @desc    Add students to class
// @route   POST /api/admin/classes/:id/students
// @access  Admin
const addStudents = async (req, res, next) => {
  try {
    const cls = await adminService.addStudents(req.params.id, req.body.studentIds || []);
    res.status(200).json({ status: 'success', data: { class: cls } });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove students from class
// @route   DELETE /api/admin/classes/:id/students
// @access  Admin
const removeStudents = async (req, res, next) => {
  try {
    const cls = await adminService.removeStudents(req.params.id, req.body.studentIds || []);
    res.status(200).json({ status: 'success', data: { class: cls } });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  listUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
  setUserActiveStatus,
  // Classes
  createClass,
  listClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudents,
  removeStudents
};


