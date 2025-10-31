const classService = require('../services/class.service');
const studentClassService = require('../services/student_class.service');

// @desc    Create class
// @route   POST /api/classes
// @access  Admin
const createClass = async (req, res, next) => {
  try {
    const cls = await classService.createClass(req.body);
    res.status(201).json({ status: 'success', data: { class: cls } });
  } catch (error) {
    next(error);
  }
};

// @desc    List classes
// @route   GET /api/classes
// @access  Admin
const listClasses = async (req, res, next) => {
  try {
    const { teacher, q } = req.query;
    const classes = await classService.listClasses({ teacher, q });
    res.status(200).json({ status: 'success', data: { classes } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get class by id
// @route   GET /api/classes/:id
// @access  Admin
const getClassById = async (req, res, next) => {
  try {
    const cls = await classService.getClassById(req.params.id);
    res.status(200).json({ status: 'success', data: { class: cls } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Admin
const updateClass = async (req, res, next) => {
  try {
    const cls = await classService.updateClass(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: { class: cls } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Admin
const deleteClass = async (req, res, next) => {
  try {
    const result = await classService.deleteClass(req.params.id);
    res.status(200).json({ status: 'success', message: result.message });
  } catch (error) {
    next(error);
  }
};

// @desc    Add student to class
// @route   POST /api/classes/:id/students
// @access  Admin
const addStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const cls = await classService.addStudent(req.params.id, studentId);
    res.status(200).json({ 
      status: 'success', 
      message: 'Thêm học sinh vào lớp thành công',
      data: { class: cls } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove student from class
// @route   DELETE /api/classes/:id/students
// @access  Admin
const removeStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const cls = await classService.removeStudent(req.params.id, studentId);
    res.status(200).json({ 
      status: 'success', 
      message: 'Xóa học sinh khỏi lớp thành công',
      data: { class: cls } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer student to new class
// @route   POST /api/classes/transfer
// @access  Admin
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

// @desc    Enroll student in class
// @route   POST /api/classes/enroll
// @access  Admin
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

// @desc    Set homeroom teacher for class
// @route   POST /api/classes/:id/teacher
// @access  Admin
const setHomeroomTeacher = async (req, res, next) => {
  try {
    const { teacherId } = req.body;
    const classData = await classService.setTeacherClass(teacherId, req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Phân công giáo viên chủ nhiệm thành công',
      data: { class: classData }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove homeroom teacher from class
// @route   DELETE /api/classes/:id/teacher
// @access  Admin
const removeHomeroomTeacher = async (req, res, next) => {
  try {
    const classData = await classService.removeTeacherFromClassByClassId(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Gỡ giáo viên chủ nhiệm thành công',
      data: { class: classData }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unassigned teachers
// @route   GET /api/classes/teachers/unassigned
// @access  Admin
const getUnassignedTeachers = async (req, res, next) => {
  try {
    const teachers = await classService.getUnassignedTeachers();
    res.status(200).json({
      status: 'success',
      data: { teachers }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get classes without homeroom teachers
// @route   GET /api/classes/without-teacher
// @access  Admin
const getClassesWithoutTeacher = async (req, res, next) => {
  try {
    const classes = await classService.getClassesWithoutTeacher();
    res.status(200).json({
      status: 'success',
      data: { classes }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get students without assigned classes
// @route   GET /api/classes/students/unassigned
// @access  Admin
const getUnassignedStudents = async (req, res, next) => {
  try {
    const students = await classService.getUnassignedStudents();
    res.status(200).json({
      status: 'success',
      data: { students }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get students of a class
// @route   GET /api/classes/:id/students
// @access  Admin
const getClassStudents = async (req, res, next) => {
  try {
    const result = await classService.getClassStudents(req.params.id);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClass,
  listClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudent,
  removeStudent,
  getClassStudents,
  getUnassignedStudents,
  // Student enrollment management
  transferStudent,
  enrollStudent,
  // Homeroom teacher management
  setHomeroomTeacher,
  removeHomeroomTeacher,
  getUnassignedTeachers,
  getClassesWithoutTeacher
};
