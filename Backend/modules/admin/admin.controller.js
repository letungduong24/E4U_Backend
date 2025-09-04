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

module.exports = {
  listUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
  setUserActiveStatus
};


