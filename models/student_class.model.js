const mongoose = require('mongoose');

const studentClassSchema = new mongoose.Schema({
  // Student reference
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Class reference
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  // Enrollment status
  status: {
    type: String,
    enum: ['enrolled', 'completed', 'dropped', 'suspended'],
    default: 'enrolled'
  },
  // Enrollment dates
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  droppedAt: {
    type: Date,
    default: null
  },
  // Additional info
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for better query performance
studentClassSchema.index({ student: 1, class: 1 }, { unique: true });
studentClassSchema.index({ student: 1, status: 1 });
studentClassSchema.index({ class: 1, status: 1 });
studentClassSchema.index({ enrolledAt: -1 });

// Static method to get class enrollment list
studentClassSchema.statics.getClassEnrollments = function(classId) {
  return this.find({ class: classId })
    .populate('student', 'firstName lastName email role')
    .sort({ enrolledAt: -1 });
};

module.exports = mongoose.model('StudentClass', studentClassSchema);