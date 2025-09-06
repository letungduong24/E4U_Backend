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
  

module.exports = {
  createSchedule,
  createPeriod
};
