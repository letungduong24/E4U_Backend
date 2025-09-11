const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  homeworkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homework',
    required: [true, 'Homework ID is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  file: {
    fileName: String,
    filePath: String
  },
  status: {
    type: String,
    enum: ['submitted', 'graded'],
    default: 'submitted'
  },
  grade: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [2000, 'Feedback cannot exceed 2000 characters']
  },
  gradedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index để đảm bảo mỗi học sinh chỉ nộp 1 lần cho 1 bài tập
submissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });

// Index để tối ưu query
submissionSchema.index({ homeworkId: 1 });
submissionSchema.index({ studentId: 1 });
submissionSchema.index({ status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);