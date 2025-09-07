const ScheduleModel = require('../models/schedule.model');
const ClassModel = require('../models/class.model');
const User = require('../models/user.model');

// @desc    Get schedules for a specific class
// @access  Student, Teacher, Admin
const getSchedulesByClass = async (classId) => {
  const schedules = await ScheduleModel.find({ class: classId })
    .populate('class', 'name grade')
    .sort({ startDate: 1 });
  
  return schedules;
};

// @desc    Get schedules for current user based on their role
// @access  Student, Teacher, Admin
const getSchedulesForUser = async (userId) => {
  const user = await User.findById(userId).select('role currentClass teachingClass');
  
  if (!user) {
    throw new Error('User not found');
  }

  let classId;
  
  switch (user.role) {
    case 'student':
      classId = user.currentClass;
      break;
    case 'teacher':
      classId = user.teachingClass;
      break;
    case 'admin':
      // Admin can see all schedules
      return await ScheduleModel.find()
        .populate('class', 'name grade')
        .sort({ startDate: 1 });
    default:
      throw new Error('Invalid user role');
  }

  if (!classId) {
    throw new Error('No class assigned to user');
  }

  return await getSchedulesByClass(classId);
};

// @desc    Get schedules within a date range
// @access  Student, Teacher, Admin
const getSchedulesByDateRange = async (startDate, endDate, classId = null) => {
  const query = {
    startDate: { $gte: new Date(startDate) },
    endDate: { $lte: new Date(endDate) }
  };

  if (classId) {
    query.class = classId;
  }

  const schedules = await ScheduleModel.find(query)
    .populate('class', 'name grade')
    .sort({ startDate: 1 });

  return schedules;
};

// @desc    Get today's schedule for a class
// @access  Student, Teacher, Admin
const getTodaysSchedule = async (classId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const schedules = await ScheduleModel.find({
    class: classId,
    startDate: { $lte: today },
    endDate: { $gte: today }
  }).populate('class', 'name grade');

  return schedules;
};

// @desc    Get schedule by ID with class information
// @access  Student, Teacher, Admin
const getScheduleById = async (scheduleId) => {
  const schedule = await ScheduleModel.findById(scheduleId)
    .populate('class', 'name grade teacher students');
  
  if (!schedule) {
    throw new Error('Schedule not found');
  }

  return schedule;
};

// @desc    Get upcoming schedules (next 7 days)
// @access  Student, Teacher, Admin
const getUpcomingSchedules = async (classId, days = 7) => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  const schedules = await ScheduleModel.find({
    class: classId,
    startDate: { $gte: today, $lte: futureDate }
  })
    .populate('class', 'name grade')
    .sort({ startDate: 1 });

  return schedules;
};

// @desc    Get schedule statistics for a class
// @access  Teacher, Admin
const getScheduleStats = async (classId) => {
  const totalSchedules = await ScheduleModel.countDocuments({ class: classId });
  const completedSchedules = await ScheduleModel.countDocuments({ 
    class: classId, 
    isDone: true 
  });
  const upcomingSchedules = await ScheduleModel.countDocuments({
    class: classId,
    startDate: { $gte: new Date() }
  });

  return {
    total: totalSchedules,
    completed: completedSchedules,
    upcoming: upcomingSchedules,
    completionRate: totalSchedules > 0 ? (completedSchedules / totalSchedules * 100).toFixed(2) : 0
  };
};

// @desc    Get schedules formatted for calendar view
// @access  Student, Teacher, Admin
const getSchedulesForCalendar = async (classId, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const schedules = await ScheduleModel.find({
    class: classId,
    startDate: { $gte: startDate },
    endDate: { $lte: endDate }
  })
    .populate('class', 'name grade')
    .sort({ startDate: 1 });

  // Format for calendar display
  const calendarData = schedules.map(schedule => ({
    id: schedule._id,
    title: schedule.class.name,
    start: schedule.startDate,
    end: schedule.endDate,
    isDone: schedule.isDone,
    periods: schedule.periods,
    class: schedule.class
  }));

  return calendarData;
};

module.exports = {
  getSchedulesByClass,
  getSchedulesForUser,
  getSchedulesByDateRange,
  getTodaysSchedule,
  getScheduleById,
  getUpcomingSchedules,
  getScheduleStats,
  getSchedulesForCalendar
};
