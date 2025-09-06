const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const homeworkController = require('../controllers/homework.controller');

const router = express.Router();

// Validation rules
const homeworkCreateValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Instructions cannot exceed 1000 characters'),
  body('class')
    .isMongoId()
    .withMessage('Valid class ID is required'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  body('allowLateSubmission')
    .optional()
    .isBoolean()
    .withMessage('allowLateSubmission must be a boolean'),
  body('maxAttempts')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Max attempts must be between 1 and 10'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array')
];

const homeworkUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Instructions cannot exceed 1000 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Valid due date is required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  body('allowLateSubmission')
    .optional()
    .isBoolean()
    .withMessage('allowLateSubmission must be a boolean'),
  body('maxAttempts')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Max attempts must be between 1 and 10'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array')
];

const submissionValidation = [
  body('content')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Content cannot exceed 5000 characters'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const gradeValidation = [
  body('score')
    .isInt({ min: 0 })
    .withMessage('Score must be a non-negative integer'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Feedback cannot exceed 2000 characters'),
  body('grade')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Grade cannot exceed 10 characters')
];

const mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid homework ID'),
  param('submissionId').isMongoId().withMessage('Invalid submission ID')
];

// Public routes (no authentication required)
// None for homework - all require authentication

// Protected routes
router.use(protect);

// Teacher routes
router.post('/', 
  authorize('teacher'), 
  homeworkCreateValidation, 
  validate, 
  homeworkController.createHomework
);

router.get('/teacher', 
  authorize('teacher'), 
  homeworkController.listHomeworks
);

router.get('/:id', 
  mongoIdValidation, 
  validate, 
  homeworkController.getHomeworkById
);

router.put('/:id', 
  authorize('teacher'), 
  mongoIdValidation, 
  homeworkUpdateValidation, 
  validate, 
  homeworkController.updateHomework
);

router.delete('/:id', 
  authorize('teacher'), 
  mongoIdValidation, 
  validate, 
  homeworkController.deleteHomework
);

router.patch('/:id/publish', 
  authorize('teacher'), 
  mongoIdValidation, 
  validate, 
  homeworkController.publishHomework
);

router.patch('/:id/close', 
  authorize('teacher'), 
  mongoIdValidation, 
  validate, 
  homeworkController.closeHomework
);

router.get('/:id/submissions', 
  authorize('teacher'), 
  mongoIdValidation, 
  validate, 
  homeworkController.getHomeworkSubmissions
);

router.get('/:id/analytics', 
  authorize('teacher'), 
  mongoIdValidation, 
  validate, 
  homeworkController.getHomeworkAnalytics
);

// Student routes
router.get('/', 
  authorize('student'), 
  homeworkController.listHomeworks
);

router.get('/upcoming', 
  authorize('student'), 
  homeworkController.getUpcomingAssignments
);

router.get('/overdue', 
  authorize('student'), 
  homeworkController.getOverdueAssignments
);

router.post('/:id/submit', 
  authorize('student'), 
  mongoIdValidation, 
  submissionValidation, 
  validate, 
  homeworkController.submitHomework
);

router.get('/submissions/student', 
  authorize('student'), 
  homeworkController.getStudentSubmissions
);

// Grading routes (teacher only)
router.patch('/submissions/:submissionId/grade', 
  authorize('teacher'), 
  gradeValidation, 
  validate, 
  homeworkController.gradeSubmission
);

module.exports = router;
