const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const studentClassController = require('../controllers/student_class.controller');

const router = express.Router();

const enrollmentValidation = [
  body('student').isMongoId().withMessage('Valid student ID is required'),
  body('class').isMongoId().withMessage('Valid class ID is required'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

const updateEnrollmentValidation = [
  body('status').optional().isIn(['enrolled', 'completed', 'dropped', 'suspended']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

const transferValidation = [
  body('studentId').isMongoId().withMessage('Valid student ID is required'),
  body('newClassId').isMongoId().withMessage('Valid new class ID is required'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

// Protect all routes and allow only admin role
router.use(protect, authorize('admin'));

// Enrollment management
router.post('/', enrollmentValidation, validate, studentClassController.enrollStudent);
router.post('/transfer', transferValidation, validate, studentClassController.transferStudent);
router.get('/student/:studentId', studentClassController.getStudentHistory);
router.get('/class/:classId', studentClassController.getClassEnrollments);
router.get('/:id', studentClassController.getEnrollmentById);
router.put('/:id', updateEnrollmentValidation, validate, studentClassController.updateEnrollment);

module.exports = router;
