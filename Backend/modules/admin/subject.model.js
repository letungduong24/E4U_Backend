const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' }}
  , 
{
  timestamps: true
});

subjectSchema.index({ code: 1 });
subjectSchema.index({ name: 1 });

module.exports = mongoose.model('Subject', subjectSchema);


