const sectionService = require('../services/section.service');
const courseService = require('../services/course.service');

async function createSection(req, res) {
    try {
        const { courseId, ...sectionData } = req.body;
        const section = await sectionService.createSection(sectionData);
        if (courseId) {
            await courseService.addSectionToCourse(courseId, section._id);
        }
        res.status(201).json({ data: section });
    } catch (error) {
        console.log({ error: error })
        res.status(500).json({ error: error.message });
    }
}

async function getSection(req, res) {
    try {
        const section = await sectionService.getSectionById(req.params.id);
        if (!section) return res.status(404).json({ error: 'Section not found' });
        res.json({ data: section });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateSection(req, res) {
    try {
        const section = await sectionService.updateSection(req.params.id, req.body);
        if (!section) return res.status(404).json({ error: 'Section not found' });
        res.json({ data: section });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteSection(req, res) {
    try {
        const { courseId } = req.query; // optional to remove association
        const section = await sectionService.deleteSection(req.params.id);
        if (!section) return res.status(404).json({ error: 'Section not found' });
        if (courseId) await courseService.removeSectionFromCourse(courseId, req.params.id);
        res.json({ message: 'Section deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function reorderSections(req, res) {
    try {
        const { courseId } = req.params;
        const { orderedSectionIds } = req.body;
        if (!Array.isArray(orderedSectionIds)) return res.status(400).json({ error: 'orderedSectionIds must be an array' });
        const course = await courseService.reorderSections(courseId, orderedSectionIds);
        res.json({ data: course });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function duplicateSection(req, res) {
    try {
        const { courseId } = req.body;
        const newSection = await sectionService.duplicateSection(req.params.id);
        if (courseId) await courseService.addSectionToCourse(courseId, newSection._id);
        res.status(201).json({ data: newSection });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createSection,
    getSection,
    updateSection,
    deleteSection,
    reorderSections,
    duplicateSection,
};
