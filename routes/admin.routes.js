const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// Validation rules

const setUserActiveValidation = [
  body('isActive').isBoolean().withMessage('isActive phải là giá trị boolean')
];


// Protect all admin routes and allow only admin role
router.use(protect, authorize('admin'));

// User management routes
router.get('/users', adminController.listUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUserByAdmin);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/active', setUserActiveValidation, validate, adminController.setUserActiveStatus);


// Class management routes
router.get('/classes', adminController.listClasses);
router.get('/classes/:id', adminController.getClassById);

// Dashboard routes
router.get('/dashboard/stats', adminController.getDashboardStats);

module.exports = router;


