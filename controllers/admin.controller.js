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
      message: 'Tạo người dùng thành công',
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

// @desc    Get dashboard statistics (admin)
// @route   GET /api/admin/dashboard/stats
// @access  Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({ status: 'success', data: { stats } });
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
  // Class management
  listClasses,
  getClassById,
  // Dashboard
  getDashboardStats,
};


