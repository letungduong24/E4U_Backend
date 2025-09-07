const scheduleViewService = require('../services/schedule-view.service');

// @desc    Get schedules for current user
// @route   GET /api/schedule-view/my-schedules
// @access  Student, Teacher, Admin
const getMySchedules = async (req, res, next) => {
  try {
    const schedules = await scheduleViewService.getSchedulesForUser(req.user.id);
    res.status(200).json({ 
      status: 'success', 
      data: { schedules: schedules } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get schedules by class ID
// @route   GET /api/schedule-view/class/:classId
// @access  Student, Teacher, Admin
const getSchedulesByClass = async (req, res, next) => {
  try {
    const schedules = await scheduleViewService.getSchedulesByClass(req.params.classId);
    res.status(200).json({ 
      status: 'success', 
      data: { schedules: schedules } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get schedules by date range
// @route   GET /api/schedule-view/date-range
// @access  Student, Teacher, Admin
const getSchedulesByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate, classId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Start date and end date are required'
      });
    }

    const schedules = await scheduleViewService.getSchedulesByDateRange(
      startDate, 
      endDate, 
      classId
    );
    
    res.status(200).json({ 
      status: 'success', 
      data: { schedules: schedules } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's schedule
// @route   GET /api/schedule-view/today
// @access  Student, Teacher, Admin
const getTodaysSchedule = async (req, res, next) => {
  try {
    const { classId } = req.query;
    
    if (!classId) {
      return res.status(400).json({
        status: 'error',
        message: 'Class ID is required'
      });
    }

    const schedules = await scheduleViewService.getTodaysSchedule(classId);
    res.status(200).json({ 
      status: 'success', 
      data: { schedules: schedules } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single schedule by ID
// @route   GET /api/schedule-view/:id
// @access  Student, Teacher, Admin
const getScheduleById = async (req, res, next) => {
  try {
    const schedule = await scheduleViewService.getScheduleById(req.params.id);
    res.status(200).json({ 
      status: 'success', 
      data: { schedule: schedule } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming schedules
// @route   GET /api/schedule-view/upcoming
// @access  Student, Teacher, Admin
const getUpcomingSchedules = async (req, res, next) => {
  try {
    const { classId, days = 7 } = req.query;
    
    if (!classId) {
      return res.status(400).json({
        status: 'error',
        message: 'Class ID is required'
      });
    }

    const schedules = await scheduleViewService.getUpcomingSchedules(classId, parseInt(days));
    res.status(200).json({ 
      status: 'success', 
      data: { schedules: schedules } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get schedule statistics
// @route   GET /api/schedule-view/stats/:classId
// @access  Teacher, Admin
const getScheduleStats = async (req, res, next) => {
  try {
    const stats = await scheduleViewService.getScheduleStats(req.params.classId);
    res.status(200).json({ 
      status: 'success', 
      data: { stats: stats } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get schedules for calendar view
// @route   GET /api/schedule-view/calendar
// @access  Student, Teacher, Admin
const getSchedulesForCalendar = async (req, res, next) => {
  try {
    const { classId, month, year } = req.query;
    
    if (!classId || !month || !year) {
      return res.status(400).json({
        status: 'error',
        message: 'Class ID, month, and year are required'
      });
    }

    const calendarData = await scheduleViewService.getSchedulesForCalendar(
      classId, 
      parseInt(month), 
      parseInt(year)
    );
    
    res.status(200).json({ 
      status: 'success', 
      data: { calendar: calendarData } 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMySchedules,
  getSchedulesByClass,
  getSchedulesByDateRange,
  getTodaysSchedule,
  getScheduleById,
  getUpcomingSchedules,
  getScheduleStats,
  getSchedulesForCalendar
};
