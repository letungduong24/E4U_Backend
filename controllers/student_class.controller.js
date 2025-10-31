const studentClassService = require('../services/student_class.service');

// @desc    Enroll student in class
// @route   POST /api/student-classes
// @access  Private (Admin only)
const enrollStudent = async (req, res, next) => {
  try {
    const enrollment = await studentClassService.enrollStudent(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Ghi danh học sinh thành công',
      data: { enrollment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get class enrollments
// @route   GET /api/student-classes/class/:classId
// @access  Private (Admin only)
const getClassEnrollments = async (req, res, next) => {
  try {
    const enrollments = await studentClassService.getClassEnrollments(req.params.classId);
    res.status(200).json({
      status: 'success',
      data: { enrollments }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrollment by ID
// @route   GET /api/student-classes/:id
// @access  Private (Admin only)
const getEnrollmentById = async (req, res, next) => {
  try {
    const enrollment = await studentClassService.getEnrollmentById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { enrollment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update enrollment
// @route   PUT /api/student-classes/:id
// @access  Private (Admin only)
const updateEnrollment = async (req, res, next) => {
  try {
    const enrollment = await studentClassService.updateEnrollment(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật đăng ký thành công',
      data: { enrollment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer student to new class
// @route   POST /api/student-classes/transfer
// @access  Private (Admin only)
const transferStudent = async (req, res, next) => {
  try {
    const { studentId, newClassId, notes } = req.body;
    const result = await studentClassService.transferStudent(studentId, newClassId, notes);
    res.status(200).json({
      status: 'success',
      message: 'Chuyển lớp học sinh thành công',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollStudent,
  getClassEnrollments,
  getEnrollmentById,
  updateEnrollment,
  transferStudent
};