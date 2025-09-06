const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  time: {
    type: String,
    enum: [
      '08:00-09:00',
      '09:10-10:10',
      '10:20-11:20',
      '11:30-12:30',
      '12:40-13:40',
      '13:50-14:50',
      '15:00-16:00',
      '16:10-17:10',
      '17:20-18:20',
      '18:30-19:30',
      '19:40-20:40'
    ],
    required: true
  },
  isDone: { type: Boolean, default: false }
}, {
  _id: false
});

const scheduleSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  periods: [periodSchema], 
  isDone: { type: Boolean, default: false },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', scheduleSchema);
