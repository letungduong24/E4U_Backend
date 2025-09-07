const scheduleServices = require('../services/schedule.service');

// @desc    Create schedule
// @route   POST /api/schedules/
// @access  Admin
const createSchedule = async (req, res, next) => {
  try {
    const schedule = await scheduleServices.createSchedule(req.body);
    res.status(201).json({ status: 'success', data: { schedule: schedule } });
  } catch (error) {
    next(error);
  }
};

const createPeriod = async (req, res, next) => {
  try {
    const schedule = await scheduleServices.createPeriod(req.body);
    res.status(201).json({ status: 'success', data: { schedule: schedule } });
  }
    catch (error) {
    next(error);
  }
}

// @desc    Get all schedules
// @route   GET /api/schedules/
// @access  Admin
const getAllSchedules = async (req, res, next) => {
  try {
    const schedules = await scheduleServices.getAllSchedules();
    res.status(200).json({ status: 'success', data: { schedules: schedules } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single schedule
// @route   GET /api/schedules/:id
// @access  Admin
const getSchedule = async (req, res, next) => {
  try {
    const schedule = await scheduleServices.getSchedule(req.params.id);
    res.status(200).json({ status: 'success', data: { schedule: schedule } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Admin
const updateSchedule = async (req, res, next) => {
  try {
    const schedule = await scheduleServices.updateSchedule(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: { schedule: schedule } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update period
// @route   PUT /api/schedules/:id/periods/:periodIndex
// @access  Admin
const updatePeriod = async (req, res, next) => {
  try {
    const periodIndex = parseInt(req.params.periodIndex);
    const schedule = await scheduleServices.updatePeriod(req.params.id, periodIndex, req.body);
    res.status(200).json({ status: 'success', data: { schedule: schedule } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Admin
const deleteSchedule = async (req, res, next) => {
  try {
    await scheduleServices.deleteSchedule(req.params.id);
    res.status(200).json({ status: 'success', message: 'Schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete period
// @route   DELETE /api/schedules/:id/periods/:periodIndex
// @access  Admin
const deletePeriod = async (req, res, next) => {
  try {
    const periodIndex = parseInt(req.params.periodIndex);
    const schedule = await scheduleServices.deletePeriod(req.params.id, periodIndex);
    res.status(200).json({ status: 'success', data: { schedule: schedule } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSchedule,
  createPeriod,
  getAllSchedules,
  getSchedule,
  updateSchedule,
  updatePeriod,
  deleteSchedule,
  deletePeriod
};
