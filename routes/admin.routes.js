const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// Validation rules
const setTeacherClassValidation = [
  body('classId').isMongoId().withMessage('Valid class ID is required')
];

const setUserActiveValidation = [
  body('isActive').isBoolean().withMessage('isActive must be a boolean value')
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

// Teacher class management routes
router.post('/teachers/:id/class', setTeacherClassValidation, validate, adminController.setTeacherClass);
router.delete('/teachers/:id/class', adminController.removeTeacherFromClass);
router.get('/teachers/unassigned', adminController.getUnassignedTeachers);
router.get('/classes/without-teacher', adminController.getClassesWithoutTeacher);

// Class management routes
router.get('/classes', adminController.listClasses);
router.get('/classes/:id', adminController.getClassById);

module.exports = router;


