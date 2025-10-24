const User = require('../models/user.model');
const ClassModel = require('../models/class.model');
const ScheduleModel = require('../models/schedule.model');

const hasConflict = async (schedule) => {  
  const conflict = await ScheduleModel.findOne({
    day: schedule.day,
    period: schedule.period,
    class: schedule.class
  });
  
  return !!conflict;
};



const createSchedule = async (payload) => {
  if (await hasConflict(payload)) {
    throw new Error('Schedule conflict detected');
  }
  const classDoc = await ClassModel.findById(payload.class);
  if (!classDoc) throw new Error('Class not found');
  const scheduleDocument = await ScheduleModel.create(payload);
  return scheduleDocument
}

const listSchedulesByClassId = async (classId, day) => {
  const schedules = await ScheduleModel.find({ class: classId,  day: day })
    .populate('class', 'name code');
  return schedules;
}

const updateSchedule = async (scheduleId, updates) => {
  const schedule = await ScheduleModel.findByIdAndUpdate(scheduleId, updates, { new: true });
  if (!schedule) throw new Error('Schedule not found');
  return schedule;
}

const deleteSchedule = async (scheduleId) => {
  const schedule = await ScheduleModel.findByIdAndDelete(scheduleId);
  if (!schedule) throw new Error('Schedule not found');
  return schedule;
}

const upcomingSchedulesForUser = async (classId) => {
  const schedules = await ScheduleModel.find({class: classId}).sort({ day: 1, period: 1 }).limit(3)
    .populate('class', 'name code');
  return schedules;
}

const getSchedulesByDate = async (day) => {
  const schedules = await ScheduleModel.find({ day })
    .populate('class', 'name code')
    .sort({ period: 1 });
  return schedules;
}


  

module.exports = {
  createSchedule,
  listSchedulesByClassId,
  updateSchedule,
  deleteSchedule,
  upcomingSchedulesForUser,
  getSchedulesByDate
};
