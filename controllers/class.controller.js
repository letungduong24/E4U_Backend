const classService = require('../services/class.service');

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
    const { page, limit, teacher, q } = req.query;
    const result = await classService.listClasses({ page, limit, teacher, q });
    res.status(200).json({ status: 'success', data: result });
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

// @desc    Add students to class
// @route   POST /api/classes/:id/students
// @access  Admin
const addStudents = async (req, res, next) => {
  try {
    const cls = await classService.addStudents(req.params.id, req.body.studentIds || []);
    res.status(200).json({ status: 'success', data: { class: cls } });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove students from class
// @route   DELETE /api/classes/:id/students
// @access  Admin
const removeStudents = async (req, res, next) => {
  try {
    const cls = await classService.removeStudents(req.params.id, req.body.studentIds || []);
    res.status(200).json({ status: 'success', data: { class: cls } });
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
  addStudents,
  removeStudents
};
