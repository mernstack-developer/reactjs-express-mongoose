const Submission = require('../models/submission.model');

async function createSubmission(assignmentId, studentId, files = [], text = '') {
  const sub = new Submission({ assignment: assignmentId, student: studentId, files, text });
  return await sub.save();
}

async function getSubmissionsForAssignment(assignmentId) {
  return await Submission.find({ assignment: assignmentId }).populate('student').lean();
}

async function getSubmissionById(id) {
  return await Submission.findById(id).populate('student').lean();
}

async function gradeSubmission(id, grade, feedback) {
  return await Submission.findByIdAndUpdate(id, { graded: true, grade, feedback }, { new: true }).lean();
}

async function getStudentSubmission(assignmentId, studentId) {
  return await Submission.findOne({ assignment: assignmentId, student: studentId }).lean();
}

module.exports = { 
  createSubmission, 
  getSubmissionsForAssignment, 
  getSubmissionById, 
  gradeSubmission,
  getStudentSubmission
};
