const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên phải có từ 2 đến 50 ký tự'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Họ phải có từ 2 đến 50 ký tự'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Vui lòng cung cấp email hợp lệ'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Mật khẩu phải có ít nhất 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Vui lòng cung cấp email hợp lệ'),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên phải có từ 2 đến 50 ký tự'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Họ phải có từ 2 đến 50 ký tự'),
  body('profile.avatar')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Ảnh đại diện phải là một URL hợp lệ'),
  body('profile.phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Vui lòng cung cấp số điện thoại hợp lệ'),
  body('profile.dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Ngày sinh phải là một ngày hợp lệ'),
  body('profile.gender')
    .optional()
    .isIn(['Nam', 'Nữ'])
    .withMessage('Lựa chọn giới tính không hợp lệ'),
  body('profile.address')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Địa chỉ không được vượt quá 100 ký tự'),
  body('profile.notification')
    .optional()
    .isBoolean()
    .withMessage('Thông báo phải là giá trị boolean')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mật khẩu hiện tại là bắt buộc'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Mật khẩu mới phải có ít nhất 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Mật khẩu mới phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Mật khẩu mới phải có ít nhất 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Mật khẩu mới phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt')
];

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/forgotpassword', forgotPasswordValidation, validate, authController.forgotPassword);
router.put('/resetpassword/:resettoken', resetPasswordValidation, validate, authController.resetPassword);

// Protected routes
router.use(protect); // Apply protection to all routes below
router.get('/me', authController.getMe);
router.put('/updateprofile', updateProfileValidation, validate, authController.updateProfile);
router.put('/changepassword', changePasswordValidation, validate, authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;
