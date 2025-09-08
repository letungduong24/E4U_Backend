const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class ID is required']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  file: {
    fileName: String,
    filePath: String,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  }
}, {
  timestamps: true
});


homeworkSchema.statics.findByClass = function(classId) {
  return this.find({ classId: classId })
    .populate('classId', 'name code')
    .sort({ deadline: 1 });
};


homeworkSchema.statics.findUpcoming = function(classId, days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    classId: classId,
    deadline: { $lte: futureDate, $gte: new Date() }
  })
  .populate('classId', 'name code')
  .sort({ deadline: 1 });
};

module.exports = mongoose.model('Homework', homeworkSchema);
