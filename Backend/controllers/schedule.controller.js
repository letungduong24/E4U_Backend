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

module.exports = {
  createSchedule,
  createPeriod
};
