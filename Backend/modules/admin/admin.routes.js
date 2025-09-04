const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const adminController = require('./admin.controller');

const router = express.Router();

const subjectCreateValidation = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name is required'),
  body('code')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Code is required')
];

const subjectUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 }),
  body('code')
    .optional()
    .trim()
    .isLength({ min: 2 })
];

// Protect all admin routes and allow only admin role
router.use(protect, authorize('admin'));

router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUserByAdmin);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/active', adminController.setUserActiveStatus);


// Subject management
router.post('/subjects', subjectCreateValidation, validate, adminController.createSubject);
router.get('/subjects', adminController.listSubjects);
router.get('/subjects/:id', adminController.getSubjectById);
router.put('/subjects/:id', subjectUpdateValidation, validate, adminController.updateSubject);
router.delete('/subjects/:id', adminController.deleteSubject);

module.exports = router;


