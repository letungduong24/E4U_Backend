const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const classController = require('../controllers/class.controller');

const router = express.Router();

const classCreateValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('code').trim().isLength({ min: 2 }).withMessage('Code is required'),
  body('students').optional().isArray(),
];

const classUpdateValidation = [
  body('name').optional().trim().isLength({ min: 2 }),
  body('code').optional().trim().isLength({ min: 2 }),
  body('students').optional().isArray(),
];

// Protect all class routes and allow only admin role
router.use(protect, authorize('admin'));

// Class management routes
router.post('/', classCreateValidation, validate, classController.createClass);
router.get('/', classController.listClasses);
router.get('/:id', classController.getClassById);
router.put('/:id', classUpdateValidation, validate, classController.updateClass);
router.delete('/:id', classController.deleteClass);
router.post('/:id/students', validate, classController.addStudents);
router.delete('/:id/students', validate, classController.removeStudents);

module.exports = router;
