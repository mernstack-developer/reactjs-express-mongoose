const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  additionalFiles: [{ filename: String, url: String }],
  settings: {
    availability: { open: Date, close: Date },
    submissionTypes: [String], // e.g., ['file', 'online_text']
    limitSubmissions: { type: Boolean, default: false },
    requireStudentStatement: { type: Boolean, default: false },
    groupSubmission: { type: Boolean, default: false },
    gradingMethod: { type: String, default: 'scale' },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
