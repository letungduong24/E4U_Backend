const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  // Assignment ID - unique identifier for the assignment
  id: {
    type: String,
    required: [true, 'Assignment ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'Assignment ID cannot be more than 20 characters']
  },
  // Class ID reference
  ClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class ID is required']
  },
  // Description of the assignment
  Description: {
    type: String,
    required: [true, 'Assignment description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  // Deadline
  Deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  // Files
  Files: [{
    filename: String,
    originalName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
homeworkSchema.index({ id: 1 }, { unique: true });
homeworkSchema.index({ ClassId: 1 });
homeworkSchema.index({ Deadline: 1 });

// Static method to find by class
homeworkSchema.statics.findByClass = function(classId) {
  return this.find({ ClassId: classId })
    .populate('ClassId', 'name code')
    .sort({ Deadline: 1 });
};

// Static method to find by assignment ID
homeworkSchema.statics.findByAssignmentId = function(assignmentId) {
  return this.findOne({ id: assignmentId })
    .populate('ClassId', 'name code');
};

// Static method to find upcoming assignments
homeworkSchema.statics.findUpcoming = function(classId, days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    ClassId: classId,
    Deadline: { $lte: futureDate, $gte: new Date() }
  })
  .populate('ClassId', 'name code')
  .sort({ Deadline: 1 });
};

module.exports = mongoose.model('Homework', homeworkSchema);
