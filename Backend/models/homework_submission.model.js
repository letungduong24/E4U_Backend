const mongoose = require('mongoose');

const homeworkSubmissionSchema = new mongoose.Schema({
  // References
  homework: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homework',
    required: [true, 'Homework reference is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class reference is required']
  },
  // Submission content
  content: {
    type: String,
    trim: true,
    maxlength: [5000, 'Content cannot be more than 5000 characters'],
    default: ''
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
  // Submission status and timing
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded', 'returned'],
    default: 'draft'
  },
  submittedAt: {
    type: Date,
    default: null
  },
  isLate: {
    type: Boolean,
    default: false
  },
  // Grading
  score: {
    type: Number,
    min: 0,
    max: 1000,
    default: null
  },
  maxScore: {
    type: Number,
    min: 0,
    max: 1000,
    required: true
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  grade: {
    type: String,
    trim: true,
    maxlength: [10, 'Grade cannot be more than 10 characters'],
    default: null
  },
  // Feedback
  feedback: {
    type: String,
    trim: true,
    maxlength: [2000, 'Feedback cannot be more than 2000 characters'],
    default: ''
  },
  gradedAt: {
    type: Date,
    default: null
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Attempt tracking
  attemptNumber: {
    type: Number,
    default: 1,
    min: 1
  },
  // Late penalty
  latePenalty: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  finalScore: {
    type: Number,
    min: 0,
    max: 1000,
    default: null
  },
  // Additional metadata
  timeSpent: {
    type: Number, // in minutes
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for better query performance
homeworkSubmissionSchema.index({ homework: 1, student: 1 }, { unique: true });
homeworkSubmissionSchema.index({ student: 1, status: 1 });
homeworkSubmissionSchema.index({ class: 1, status: 1 });
homeworkSubmissionSchema.index({ submittedAt: -1 });
homeworkSubmissionSchema.index({ gradedAt: -1 });

// Pre-save middleware to calculate derived fields
homeworkSubmissionSchema.pre('save', function(next) {
  // Calculate percentage if score is provided
  if (this.score !== null && this.maxScore > 0) {
    this.percentage = Math.round((this.score / this.maxScore) * 100);
  }
  
  // Calculate final score with late penalty
  if (this.score !== null) {
    if (this.isLate && this.latePenalty > 0) {
      this.finalScore = Math.max(0, this.score - (this.score * this.latePenalty / 100));
    } else {
      this.finalScore = this.score;
    }
  }
  
  // Set submittedAt when status changes to submitted
  if (this.isModified('status') && this.status === 'submitted' && !this.submittedAt) {
    this.submittedAt = new Date();
  }
  
  // Set gradedAt when status changes to graded
  if (this.isModified('status') && this.status === 'graded' && !this.gradedAt) {
    this.gradedAt = new Date();
  }
  
  next();
});

// Virtual for grade letter
homeworkSubmissionSchema.virtual('gradeLetter').get(function() {
  if (this.percentage === null) return null;
  
  if (this.percentage >= 90) return 'A';
  if (this.percentage >= 80) return 'B';
  if (this.percentage >= 70) return 'C';
  if (this.percentage >= 60) return 'D';
  return 'F';
});

// Static method to find by homework
homeworkSubmissionSchema.statics.findByHomework = function(homeworkId) {
  return this.find({ homework: homeworkId })
    .populate('student', 'firstName lastName email')
    .sort({ submittedAt: -1 });
};

// Static method to find by student
homeworkSubmissionSchema.statics.findByStudent = function(studentId, classId = null) {
  const query = { student: studentId };
  if (classId) query.class = classId;
  
  return this.find(query)
    .populate('homework', 'title dueDate points type')
    .populate('gradedBy', 'firstName lastName')
    .sort({ submittedAt: -1 });
};

// Static method to find ungraded submissions
homeworkSubmissionSchema.statics.findUngraded = function(classId = null) {
  const query = { status: 'submitted' };
  if (classId) query.class = classId;
  
  return this.find(query)
    .populate('homework', 'title dueDate points type')
    .populate('student', 'firstName lastName email')
    .sort({ submittedAt: 1 });
};

// Instance method to check if submission is on time
homeworkSubmissionSchema.methods.isOnTime = function() {
  if (!this.submittedAt || !this.homework) return false;
  return this.submittedAt <= this.homework.dueDate;
};

module.exports = mongoose.model('HomeworkSubmission', homeworkSubmissionSchema);
