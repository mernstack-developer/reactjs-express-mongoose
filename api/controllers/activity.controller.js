const activityService = require('../services/activity.service');

async function createActivity(req, res) {
  try {
    const { sectionId } = req.body;
    const payload = req.body.activity || req.body;
    const activity = await activityService.createActivity(sectionId, payload);
    res.status(201).json({ data: activity });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

async function getActivity(req, res) {
  try {
    const activity = await activityService.getActivityById(req.params.id);
    res.json({ data: activity });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

async function updateActivity(req, res) {
  try {
    const activity = await activityService.updateActivity(req.params.id, req.body);
    res.json({ data: activity });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

async function deleteActivity(req, res) {
  try {
    const { sectionId } = req.query;
    await activityService.deleteActivity(req.params.id, sectionId);
    res.json({ data: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

module.exports = { createActivity, getActivity, updateActivity, deleteActivity };
