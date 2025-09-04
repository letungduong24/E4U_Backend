const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const adminController = require('./admin.controller');

const router = express.Router();

const classCreateValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('code').trim().isLength({ min: 2 }).withMessage('Code is required'),
  body('homeroomTeacher').isMongoId().withMessage('homeroomTeacher is required'),
  body('students').optional().isArray(),
  body('schedule').optional().isArray(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601()
];

const classUpdateValidation = [
  body('name').optional().trim().isLength({ min: 2 }),
  body('code').optional().trim().isLength({ min: 2 }),
  body('homeroomTeacher').optional().isMongoId(),
  body('students').optional().isArray(),
  body('schedule').optional().isArray(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601()
];

// Protect all admin routes and allow only admin role
router.use(protect, authorize('admin'));

router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUserByAdmin);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/active', adminController.setUserActiveStatus);


// Class management
router.post('/classes', classCreateValidation, validate, adminController.createClass);
router.get('/classes', adminController.listClasses);
router.get('/classes/:id', adminController.getClassById);
router.put('/classes/:id', classUpdateValidation, validate, adminController.updateClass);
router.delete('/classes/:id', adminController.deleteClass);
router.post('/classes/:id/students', validate, adminController.addStudents);
router.delete('/classes/:id/students', validate, adminController.removeStudents);

module.exports = router;


