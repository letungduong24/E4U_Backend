const User = require('../models/user.model');
const ClassModel = require('../models/class.model');
const ScheduleModel = require('../models/schedule.model');

const hasConflict = async (payload) => {
  const { time, schedule} = payload;
  
  const conflict = await ScheduleModel.findOne({
    _id: schedule,
    periods: {
        $elemMatch:{
            time: time,
        }
    } 
  });
  
  return !!conflict;
};

const createSchedule = async (payload) => {
  const scheduleDocument = await ScheduleModel.create(payload);
  return scheduleDocument
}

const createPeriod = async (payload) => {
  const { time, schedule} = payload;
  const conflict = await hasConflict(payload);
  if(conflict) {
    throw new Error('Schedule conflict detected');
  }
    const scheduleDocument = await ScheduleModel.findById(schedule)
    if(!scheduleDocument) {
        throw new Error('Schedule not found');
    }
    scheduleDocument.periods.push({ time: time });
    await scheduleDocument.save();
    return scheduleDocument;
}

const updateSchedule = async (scheduleId, payload) => {
  const scheduleDocument = await ScheduleModel.findById(scheduleId);
  if (!scheduleDocument) {
    throw new Error('Schedule not found');
  }

  // Update schedule fields
  Object.keys(payload).forEach(key => {
    if (key !== 'periods' && payload[key] !== undefined) {
      scheduleDocument[key] = payload[key];
    }
  });

  await scheduleDocument.save();
  return scheduleDocument;
}

const updatePeriod = async (scheduleId, periodIndex, payload) => {
  const scheduleDocument = await ScheduleModel.findById(scheduleId);
  if (!scheduleDocument) {
    throw new Error('Schedule not found');
  }

  if (periodIndex < 0 || periodIndex >= scheduleDocument.periods.length) {
    throw new Error('Period not found');
  }

  // Check for conflicts if time is being updated
  if (payload.time && payload.time !== scheduleDocument.periods[periodIndex].time) {
    const conflict = await hasConflict({ time: payload.time, schedule: scheduleId });
    if (conflict) {
      throw new Error('Schedule conflict detected');
    }
  }

  // Update period
  Object.keys(payload).forEach(key => {
    if (payload[key] !== undefined) {
      scheduleDocument.periods[periodIndex][key] = payload[key];
    }
  });

  await scheduleDocument.save();
  return scheduleDocument;
}

const deleteSchedule = async (scheduleId) => {
  const scheduleDocument = await ScheduleModel.findByIdAndDelete(scheduleId);
  if (!scheduleDocument) {
    throw new Error('Schedule not found');
  }
  return scheduleDocument;
}

const deletePeriod = async (scheduleId, periodIndex) => {
  const scheduleDocument = await ScheduleModel.findById(scheduleId);
  if (!scheduleDocument) {
    throw new Error('Schedule not found');
  }

  if (periodIndex < 0 || periodIndex >= scheduleDocument.periods.length) {
    throw new Error('Period not found');
  }

  scheduleDocument.periods.splice(periodIndex, 1);
  await scheduleDocument.save();
  return scheduleDocument;
}

const getSchedule = async (scheduleId) => {
  const scheduleDocument = await ScheduleModel.findById(scheduleId).populate('class');
  if (!scheduleDocument) {
    throw new Error('Schedule not found');
  }
  return scheduleDocument;
}

const getAllSchedules = async () => {
  const schedules = await ScheduleModel.find().populate('class');
  return schedules;
}

module.exports = {
  createSchedule,
  createPeriod,
  updateSchedule,
  updatePeriod,
  deleteSchedule,
  deletePeriod,
  getSchedule,
  getAllSchedules
};
