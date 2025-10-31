const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const submissionController = require('../controllers/submission.controller');

const router = express.Router();

// Validation rules
const submissionCreateValidation = [
  body('homeworkId')
    .isMongoId()
    .withMessage('homeworkId hợp lệ là bắt buộc'),
  body('file')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Link file không được để trống')
];

const submissionUpdateValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID bài nộp hợp lệ là bắt buộc'),
  body('file')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Link file không được để trống')
];

const gradeValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID bài nộp hợp lệ là bắt buộc'),
  body('grade')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Điểm phải từ 0 đến 100'),
  body('feedback')
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('Phản hồi không được vượt quá 2000 ký tự')
];

// Public routes (no authentication required)
// None for submissions - all require authentication

// Protected routes
router.use(protect);


// Student routes
router.post('/',
  authorize('student'),
  submissionCreateValidation,
  validate,
  submissionController.createSubmission
);

router.put('/:id',
  authorize('student'),
  submissionUpdateValidation,
  validate,
  submissionController.updateSubmission
);

router.delete('/:id',
  authorize('student'),
  [
    param('id').isMongoId().withMessage('Valid submission ID is required')
  ],
  validate,
  submissionController.deleteSubmission
);

router.get('/student',
  authorize('student'),
  submissionController.getStudentSubmissions
);

router.get('/student/graded',
  authorize('student'),
  submissionController.getGradedSubmissionsForStudent
);

// Teacher routes
router.post('/:id/grade',
  authorize('teacher'),
  gradeValidation,
  validate,
  submissionController.gradeSubmission
);

router.get('/homework/:homeworkId/student',
  authorize('student'),
  [
    param('homeworkId').isMongoId().withMessage('ID bài tập hợp lệ là bắt buộc')
  ],
  validate,
  submissionController.getSubmissionByHomeworkIdForStudent
);

router.get('/homework/:homeworkId/teacher',
  authorize('teacher'),
  [
    param('homeworkId').isMongoId().withMessage('ID bài tập hợp lệ là bắt buộc')
  ],
  validate,
  submissionController.getSubmissionsByHomeworkIdForTeacher
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