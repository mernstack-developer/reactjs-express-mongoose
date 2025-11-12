const Activity = require('../models/activity.model');
const Section = require('../models/section.model');

async function createActivity(sectionId, data) {
  const activity = new Activity(data);
  const saved = await activity.save();
  // Attach reference to section
  if (sectionId) {
    await Section.findByIdAndUpdate(sectionId, { $push: { activities: saved._id } });
  }
  return saved;
}

async function getActivityById(id) {
  return await Activity.findById(id).lean();
}

async function updateActivity(id, data) {
  return await Activity.findByIdAndUpdate(id, data, { new: true }).lean();
}

async function deleteActivity(id, sectionId) {
  await Activity.findByIdAndDelete(id);
  if (sectionId) await Section.findByIdAndUpdate(sectionId, { $pull: { activities: id } });
}

module.exports = { createActivity, getActivityById, updateActivity, deleteActivity };
