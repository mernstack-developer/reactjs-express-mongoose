const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  files: [{ filename: String, url: String }],
  text: { type: String },
  submittedAt: { type: Date, default: Date.now },
  graded: { type: Boolean, default: false },
  grade: { type: Number },
  feedback: { type: String },
});

module.exports = mongoose.model('Submission', SubmissionSchema);
