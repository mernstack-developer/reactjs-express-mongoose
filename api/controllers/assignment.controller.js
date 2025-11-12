const assignmentService = require('../services/assignment.service');
const submissionService = require('../services/submission.service');

async function createAssignment(req, res) {
  try {
    const creatorId = req.user?.id;
    const payload = req.body;
    const saved = await assignmentService.createAssignment(payload);
    res.status(201).json({ data: saved });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

async function createAssignmentActivity(req, res) {
  try {
    const creatorId = req.user?.id;
    const { sectionId, assignment } = req.body;
    const { assignment: savedAssignment, activity } = await assignmentService.createAssignmentActivity(sectionId, assignment, creatorId);
    res.status(201).json({ data: { assignment: savedAssignment, activity } });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

async function getAssignment(req, res) {
  try {
    const a = await assignmentService.getAssignmentById(req.params.id);
    res.json({ data: a });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

async function submitAssignment(req, res) {
  try {
    const studentId = req.user?.id;
    const assignmentId = req.params.id;
    const { text, files } = req.body; // files expected to be [{filename,url}]
    const sub = await submissionService.createSubmission(assignmentId, studentId, files || [], text || '');
    res.status(201).json({ data: sub });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

async function gradeSubmission(req, res) {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    const updated = await submissionService.gradeSubmission(submissionId, grade, feedback);
    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

async function listSubmissions(req, res) {
  try {
    const assignmentId = req.params.id;
    const subs = await submissionService.getSubmissionsForAssignment(assignmentId);
    res.json({ data: subs });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

module.exports = { createAssignment, getAssignment, createAssignmentActivity, submitAssignment, gradeSubmission, listSubmissions };
