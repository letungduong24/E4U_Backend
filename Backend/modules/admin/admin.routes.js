const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const adminController = require('./admin.controller');

const router = express.Router();

// Protect all admin routes and allow only admin role
router.use(protect, authorize('admin'));

router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUserByAdmin);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/active', adminController.setUserActiveStatus);

module.exports = router;


