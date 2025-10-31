const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  // Teacher relationship
  homeroomTeacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
  },
  // Student relationships
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Class metadata
  maxStudents: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

classSchema.index({ code: 1 }, { unique: true });
classSchema.index({ name: 1 });

module.exports = mongoose.model('Class', classSchema);


