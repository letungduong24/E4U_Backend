const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Homework title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Homework description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Instructions cannot be more than 1000 characters'],
    default: ''
  },
  // Class and teacher relationships
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class reference is required']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher reference is required']
  },
  // Due date and timing
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  // Assignment details
  points: {
    type: Number,
    default: 100,
    min: [0, 'Points cannot be negative'],
    max: [1000, 'Points cannot exceed 1000']
  },
  type: {
    type: String,
    enum: ['assignment', 'quiz', 'project', 'essay', 'presentation', 'lab'],
    default: 'assignment'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  // File attachments
  attachments: [{
    filename: String,
    originalName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Submission settings
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  latePenalty: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  maxAttempts: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  // Grading settings
  gradingType: {
    type: String,
    enum: ['points', 'percentage', 'letter'],
    default: 'points'
  },
  rubric: {
    type: String,
    trim: true,
    maxlength: [2000, 'Rubric cannot be more than 2000 characters'],
    default: ''
  },
  // Additional metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }],
  isVisible: {
    type: Boolean,
    default: true
  },
  // Statistics (computed fields)
  totalSubmissions: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
homeworkSchema.index({ class: 1, status: 1 });
homeworkSchema.index({ teacher: 1, status: 1 });
homeworkSchema.index({ dueDate: 1 });
homeworkSchema.index({ assignedDate: -1 });
homeworkSchema.index({ type: 1 });

// Virtual for submission count
homeworkSchema.virtual('submissionCount').get(function() {
  return this.totalSubmissions;
});

// Pre-save middleware to validate due date
homeworkSchema.pre('save', function(next) {
  if (this.dueDate && this.dueDate <= this.assignedDate) {
    return next(new Error('Due date must be after assigned date'));
  }
  next();
});

// Static method to find by class
homeworkSchema.statics.findByClass = function(classId, status = 'published') {
  return this.find({ class: classId, status, isVisible: true })
    .populate('teacher', 'firstName lastName email')
    .sort({ dueDate: 1 });
};

// Static method to find by teacher
homeworkSchema.statics.findByTeacher = function(teacherId, status = null) {
  const query = { teacher: teacherId };
  if (status) query.status = status;
  return this.find(query)
    .populate('class', 'name code')
    .sort({ assignedDate: -1 });
};

// Static method to find upcoming assignments
homeworkSchema.statics.findUpcoming = function(classId, days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    class: classId,
    status: 'published',
    isVisible: true,
    dueDate: { $lte: futureDate, $gte: new Date() }
  })
  .populate('teacher', 'firstName lastName')
  .sort({ dueDate: 1 });
};

module.exports = mongoose.model('Homework', homeworkSchema);
