const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const homeworkController = require('../controllers/homework.controller');

const router = express.Router();

// Validation rules
const homeworkCreateValidation = [
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Mô tả phải có từ 10 đến 2000 ký tự'),
  body('deadline')
    .isISO8601()
    .withMessage('Hạn nộp bài hợp lệ là bắt buộc')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Hạn nộp bài phải ở tương lai');
      }
      return true;
    }),
];

const homeworkUpdateValidation = [
  body('id')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('ID bài tập phải có từ 2 đến 20 ký tự')
    .matches(/^[A-Z0-9_]+$/)
    .withMessage('ID bài tập chỉ được chứa chữ hoa, số và dấu gạch dưới'),
  body('Description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Mô tả phải có từ 10 đến 2000 ký tự'),
  body('Deadline')
    .optional()
    .isISO8601()
    .withMessage('Hạn nộp bài hợp lệ là bắt buộc')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Hạn nộp bài phải ở tương lai');
      }
      return true;
    }),
  body('Files')
    .optional()
    .isArray()
    .withMessage('Files phải là một mảng')
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

router.get('/', 
  authorize('teacher', 'student'), 
  homeworkController.listHomeworks
);

router.get('/:id/homeworkid', 
  validate, 
  homeworkController.getHomeworkById
);

router.get('/:id/classid', 
  validate, 
  homeworkController.getHomeworkByClassId
);

router.put('/:id', 
  authorize('teacher'), 
  homeworkUpdateValidation, 
  validate, 
  homeworkController.updateHomework
);

router.delete('/:id', 
  authorize('teacher'), 
  validate, 
  homeworkController.deleteHomework
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
