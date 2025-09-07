const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const homeworkController = require('../controllers/homework.controller');

const router = express.Router();

// Validation rules
const homeworkCreateValidation = [
  body('id')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Assignment ID must be between 2 and 20 characters')
    .matches(/^[A-Z0-9_]+$/)
    .withMessage('Assignment ID must contain only uppercase letters, numbers, and underscores'),
  body('Description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('ClassId')
    .isMongoId()
    .withMessage('Valid Class ID is required'),
  body('Deadline')
    .isISO8601()
    .withMessage('Valid deadline is required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  body('Files')
    .optional()
    .isArray()
    .withMessage('Files must be an array')
];

const homeworkUpdateValidation = [
  body('id')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Assignment ID must be between 2 and 20 characters')
    .matches(/^[A-Z0-9_]+$/)
    .withMessage('Assignment ID must contain only uppercase letters, numbers, and underscores'),
  body('Description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('Deadline')
    .optional()
    .isISO8601()
    .withMessage('Valid deadline is required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  body('Files')
    .optional()
    .isArray()
    .withMessage('Files must be an array')
];


const mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid homework ID')
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


module.exports = router;
