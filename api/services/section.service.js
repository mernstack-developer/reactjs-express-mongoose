const Section = require('../models/section.model');

async function createSection(data) {
    const section = new Section(data);
    return await section.save();
}

async function getSections(filter = {}) {
    return await Section.find(filter).populate('activities').lean();
}

async function getSectionById(id) {
    return await Section.findById(id).populate('activities').lean();
}

async function updateSection(id, data) {
    return await Section.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

async function deleteSection(id) {
    return await Section.findByIdAndDelete(id).lean();
}

async function duplicateSection(id) {
    const section = await Section.findById(id).lean();
    if (!section) throw new Error('Section not found');
    const copy = { ...section };
    delete copy._id;
    copy.title = `${copy.title} (copy)`;
    const newSection = new Section(copy);
    return await newSection.save();
}

module.exports = {
    createSection,
    getSections,
    getSectionById,
    updateSection,
    deleteSection,
    duplicateSection,
};
