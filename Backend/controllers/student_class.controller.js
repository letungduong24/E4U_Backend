const studentClassService = require('../services/student_class.service');

// @desc    Enroll student in class
// @route   POST /api/student-classes
// @access  Private (Admin only)
const enrollStudent = async (req, res, next) => {
  try {
    const enrollment = await studentClassService.enrollStudent(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Student enrolled successfully',
      data: { enrollment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's enrollment history
// @route   GET /api/student-classes/student/:studentId
// @access  Private (Admin only)
const getStudentHistory = async (req, res, next) => {
  try {
    const history = await studentClassService.getStudentHistory(req.params.studentId);
    res.status(200).json({
      status: 'success',
      data: { history }
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
      message: 'Enrollment updated successfully',
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
      message: 'Student transferred successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollStudent,
  getStudentHistory,
  getClassEnrollments,
  getEnrollmentById,
  updateEnrollment,
  transferStudent
};
