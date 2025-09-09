const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const submissionController = require('../controllers/submission.controller');

const router = express.Router();

// Validation rules
const submissionCreateValidation = [
  body('homeworkId')
    .isMongoId()
    .withMessage('Valid homeworkId is required'),
  body('file')
    .optional()
    .custom((value) => {
      // Cho phép file upload hoặc object
      if (typeof value === 'string' || typeof value === 'object' || value === undefined) {
        return true;
      }
      throw new Error('File must be a valid file or object');
    })
];

const submissionUpdateValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid submission ID is required'),
  body('file')
    .optional()
    .custom((value) => {
      // Cho phép file upload hoặc object
      if (typeof value === 'string' || typeof value === 'object' || value === undefined) {
        return true;
      }
      throw new Error('File must be a valid file or object');
    })
];

const gradeValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid submission ID is required'),
  body('grade')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Grade must be between 0 and 100'),
  body('feedback')
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('Feedback cannot exceed 2000 characters')
];

// Public routes (no authentication required)
// None for submissions - all require authentication

// Protected routes
router.use(protect);

// Student routes
router.post('/',
  authorize('student'),
  upload.single('file'),
  submissionCreateValidation,
  validate,
  submissionController.createSubmission
);

router.put('/:id',
  authorize('student'),
  upload.single('file'),
  submissionUpdateValidation,
  validate,
  submissionController.updateSubmission
);

router.get('/student',
  authorize('student'),
  submissionController.getStudentSubmissions
);

// Teacher routes
router.post('/:id/grade',
  authorize('teacher'),
  gradeValidation,
  validate,
  submissionController.gradeSubmission
);

router.get('/homework/:homeworkId/status',
  authorize('teacher'),
  [
    param('homeworkId').isMongoId().withMessage('Valid homework ID is required')
  ],
  validate,
  submissionController.getSubmissionStatusByHomework
);

// Shared routes (Student and Teacher)
router.get('/:id',
  authorize('student', 'teacher'),
  [
    param('id').isMongoId().withMessage('Valid submission ID is required')
  ],
  validate,
  submissionController.getSubmissionById
);

module.exports = router;
