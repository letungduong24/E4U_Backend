const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Document description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class ID is required']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  file: {
    fileName: String,
    filePath: String,
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
documentSchema.index({ classId: 1 });
documentSchema.index({ teacherId: 1 });
documentSchema.index({ title: 'text', description: 'text' });

// Static method to find documents by class
documentSchema.statics.findByClass = function(classId) {
  return this.find({ classId: classId, isActive: true })
    .populate('classId', 'name code')
    .sort({ createdAt: -1 });
};

// Static method to find documents by teacher
documentSchema.statics.findByTeacher = function(teacherId) {
  return this.find({ teacherId: teacherId, isActive: true })
    .populate('classId', 'name code')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Document', documentSchema);
