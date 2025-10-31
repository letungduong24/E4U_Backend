const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const classController = require('../controllers/class.controller');

const router = express.Router();

const classCreateValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('code').trim().isLength({ min: 2 }).withMessage('Code is required'),
];

const classUpdateValidation = [
  body('name').optional().trim().isLength({ min: 2 }),
  body('code').optional().trim().isLength({ min: 2 }),
  body('students').optional().isArray(),
];

const addStudentValidation = [
  body('studentId').isMongoId().withMessage('Valid student ID is required')
];

const removeStudentValidation = [
  body('studentId').isMongoId().withMessage('Valid student ID is required')
];

const transferStudentValidation = [
  body('studentId').isMongoId().withMessage('Valid student ID is required'),
  body('newClassId').isMongoId().withMessage('Valid new class ID is required'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

const enrollStudentValidation = [
  body('student').isMongoId().withMessage('Valid student ID is required'),
  body('class').isMongoId().withMessage('Valid class ID is required'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

const setTeacherValidation = [
  body('teacherId').isMongoId().withMessage('Valid teacher ID is required')
];

// Protect all class routes and allow only admin role
router.use(protect, authorize('admin'));

// Class management routes
router.post('/', classCreateValidation, validate, classController.createClass);
router.get('/', classController.listClasses);
router.get('/:id', classController.getClassById);
router.put('/:id', classUpdateValidation, validate, classController.updateClass);
router.delete('/:id', classController.deleteClass);
router.get('/:id/students', classController.getClassStudents);
router.post('/:id/students', addStudentValidation, validate, classController.addStudent);
router.delete('/:id/students', removeStudentValidation, validate, classController.removeStudent);

// Student enrollment management routes
router.post('/transfer', transferStudentValidation, validate, classController.transferStudent);
router.post('/enroll', enrollStudentValidation, validate, classController.enrollStudent);

// Homeroom teacher management routes
router.post('/:id/teacher', setTeacherValidation, validate, classController.setHomeroomTeacher);
router.delete('/:id/teacher', classController.removeHomeroomTeacher);
router.get('/teachers/unassigned', classController.getUnassignedTeachers);
router.get('/without-teacher', classController.getClassesWithoutTeacher);

// Student management routes
router.get('/students/unassigned', classController.getUnassignedStudents);

module.exports = router;
