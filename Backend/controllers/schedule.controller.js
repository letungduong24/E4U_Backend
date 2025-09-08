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


// @desc    List schedules
// @route   GET /api/schedules/:id/classid?day=2025-12-31
// @access  Admin
const listSchedulesByClassId = async (req, res, next) => {
  try {
    const classId = req.params.id;
    const day = req.query.day;
    const schedules = await scheduleServices.listSchedulesByClassId(classId, day);
    res.status(200).json({ status: 'success', data: { schedules } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teacher/student schedule
// @route   GET /api/schedules/my-schedule?day=2025-12-31
// @access  Teacher/Student
const mySchedule = async (req, res, next) => {
  try {
    const user = req.user;
    const day = req.query.day;
    if(user.role === 'teacher') {
        const schedules = await scheduleServices.listSchedulesByClassId(user.teachingClass, day);
        return res.status(200).json({ status: 'success', data: { schedules } });
    }
    else if(user.role === 'student') {
        const schedules = await scheduleServices.listSchedulesByClassId(user.currentClass, day);
        return res.status(200).json({ status: 'success', data: { schedules } });
    }
    else {
        return res.status(403).json({ status: 'fail', message: 'Access denied' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Admin
const updateSchedule = async (req, res, next) => {
  try {
    const scheduleId = req.params.id;
    const updates = req.body;
    const updatedSchedule = await scheduleServices.updateSchedule(scheduleId, updates);
    res.status(200).json({ status: 'success', data: { schedule: updatedSchedule } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Admin
const deleteSchedule = async (req, res, next) => {
  try {
    const scheduleId = req.params.id;
    await scheduleServices.deleteSchedule(scheduleId);
    res.status(200).json({ status: 'success', message: 'Schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming schedules for user
// @route   GET /api/schedules/upcoming
// @access  Teacher/Student 
const upcomingSchedulesForUser = async (req, res, next) => {
  try {
    const user = req.user;
    if(user.role === 'teacher') {
        const schedules = await scheduleServices.upcomingSchedulesForUser(user.teachingClass);
        return res.status(200).json({ status: 'success', data: { schedules } });
    }
    else if(user.role === 'student') {
        const schedules = await scheduleServices.upcomingSchedulesForUser(user.currentClass);
        return res.status(200).json({ status: 'success', data: { schedules } });
    }
    else {
        return res.status(403).json({ status: 'fail', message: 'Access denied' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSchedule,
  listSchedulesByClassId,
  mySchedule,
  updateSchedule,
  deleteSchedule,
  upcomingSchedulesForUser
};
