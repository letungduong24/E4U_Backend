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
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  body('file')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('File path cannot be empty')
];

const updateDocumentValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  body('file')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('File path cannot be empty')
];

const searchValidation = [
  body('q')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term cannot be empty')
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
