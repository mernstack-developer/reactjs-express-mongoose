const Assignment = require('../models/assignment.model');
const Activity = require('../models/activity.model');
const Section = require('../models/section.model');

async function createAssignment(payload) {
  const a = new Assignment(payload);
  return await a.save();
}

async function getAssignmentById(id) {
  return await Assignment.findById(id).lean();
}

async function updateAssignment(id, data) {
  return await Assignment.findByIdAndUpdate(id, data, { new: true }).lean();
}

async function deleteAssignment(id) {
  return await Assignment.findByIdAndDelete(id).lean();
}

// Helper that creates an assignment and also creates an Activity entry and links to section
async function createAssignmentActivity(sectionId, payload, creatorId) {
  const assignment = new Assignment({ ...payload, createdBy: creatorId });
  const saved = await assignment.save();
  const activity = new Activity({ type: 'assignment', title: saved.title, config: { assignmentId: saved._id }, createdBy: creatorId });
  const savedAct = await activity.save();
  if (sectionId) await Section.findByIdAndUpdate(sectionId, { $push: { activities: savedAct._id } });
  return { assignment: saved, activity: savedAct };
}

module.exports = { createAssignment, getAssignmentById, updateAssignment, deleteAssignment, createAssignmentActivity };
