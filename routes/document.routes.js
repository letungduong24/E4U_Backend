const express = require('express');
const { body } = require('express-validator');
const documentController = require('../controllers/document.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const createDocumentValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Tiêu đề phải có từ 1 đến 200 ký tự'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Mô tả phải có từ 1 đến 2000 ký tự'),
  body('file')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Đường dẫn tệp không được để trống')
];

const updateDocumentValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Tiêu đề phải có từ 1 đến 200 ký tự'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Mô tả phải có từ 1 đến 2000 ký tự'),
  body('file')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Đường dẫn tệp không được để trống')
];

const searchValidation = [
  body('q')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Thuật ngữ tìm kiếm không được để trống')
];

// All routes are protected
router.use(protect);

// @route   POST /api/documents
// @desc    Create a new document
// @access  Teacher only
router.post(
  '/',
  authorize('teacher'),
  createDocumentValidation,
  validate,
  documentController.createDocument
);

// @route   GET /api/documents
// @desc    List documents with filters
// @access  Teacher, Student
router.get('/', documentController.listDocuments);

// @route   GET /api/documents/search
// @desc    Search documents
// @access  Teacher, Student
router.get('/search', documentController.searchDocuments);


// @route   GET /api/documents/class/:classId
// @desc    Get documents by class ID
// @access  Teacher, Student (if enrolled in the class)
router.get('/class/:classId', documentController.getDocumentsByClassId);

// @route   GET /api/documents/:id
// @desc    Get document by ID
// @access  Teacher, Student (if enrolled in the class)
router.get('/:id', documentController.getDocumentById);

// @route   GET /api/documents/:id/download
// @desc    Download document file
// @access  Teacher, Student (if enrolled in the class)
router.get('/:id/download', documentController.downloadDocument);

// @route   PUT /api/documents/:id
// @desc    Update document
// @access  Teacher (owner only)
router.put(
  '/:id',
  authorize('teacher'),
  updateDocumentValidation,
  validate,
  documentController.updateDocument
);

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Teacher (owner only)
router.delete('/:id', authorize('teacher'), documentController.deleteDocument);

module.exports = router;
