const sectionService = require('../services/section.service');
const courseService = require('../services/course.service');
const { Section, SectionProgress } = require('../models/section.model');

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

// Section Progress Tracking Methods

async function getSectionProgress(req, res) {
    try {
        const { id: sectionId } = req.params;
        const userId = req.user.id;
        
        const progress = await Section.getProgressForUser(sectionId, userId);
        
        res.json({ 
            success: true, 
            data: progress || {
                sectionId,
                userId,
                timeSpent: 0,
                durationWatched: 0,
                completionPercentage: 0,
                isCompleted: false,
                progressLogs: []
            }
        });
    } catch (error) {
        console.error('Get section progress error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

async function updateSectionProgress(req, res) {
    try {
        const { id: sectionId } = req.params;
        const userId = req.user.id;
        const { timeSpent = 0, durationWatched = 0 } = req.body;
        
        const progress = await Section.updateProgress(sectionId, userId, timeSpent, durationWatched);
        
        res.json({ 
            success: true, 
            data: progress 
        });
    } catch (error) {
        console.error('Update section progress error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

async function updateSectionProgressBatch(req, res) {
    try {
        const { id: sectionId } = req.params;
        const userId = req.user.id;
        const { progressUpdates = [] } = req.body;
        
        // Process multiple progress updates
        const results = [];
        let totalTimeSpent = 0;
        let totalDurationWatched = 0;
        
        for (const update of progressUpdates) {
            const { timeSpent = 0, durationWatched = 0 } = update;
            totalTimeSpent += timeSpent;
            totalDurationWatched += durationWatched;
        }
        
        // Update progress with accumulated values
        const progress = await Section.updateProgress(
            sectionId, 
            userId, 
            totalTimeSpent, 
            totalDurationWatched
        );
        
        res.json({ 
            success: true, 
            data: progress 
        });
    } catch (error) {
        console.error('Batch update section progress error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

async function getSectionProgressLogs(req, res) {
    try {
        const { id: sectionId } = req.params;
        const userId = req.user.id;
        
        const progress = await SectionProgress.findOne({ 
            sectionId, 
            userId 
        }).sort({ lastActivityAt: -1 });
        
        if (!progress) {
            return res.json({ 
                success: true, 
                data: { 
                    progressLogs: [],
                    totalTimeSpent: 0,
                    totalDurationWatched: 0,
                    completionPercentage: 0
                } 
            });
        }
        
        res.json({ 
            success: true, 
            data: { 
                progressLogs: progress.progressLogs,
                totalTimeSpent: progress.timeSpent,
                totalDurationWatched: progress.durationWatched,
                completionPercentage: progress.completionPercentage,
                isCompleted: progress.isCompleted
            }
        });
    } catch (error) {
        console.error('Get section progress logs error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

async function getSectionAnalytics(req, res) {
    try {
        const { id: sectionId } = req.params;
        
        // Get section analytics
        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }
        
        const progressStats = await SectionProgress.aggregate([
            { $match: { sectionId: section._id } },
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    completedUsers: { $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] } },
                    avgTimeSpent: { $avg: '$timeSpent' },
                    avgCompletionPercentage: { $avg: '$completionPercentage' },
                    totalViews: { $sum: '$timeSpent' }
                }
            }
        ]);
        
        const analytics = {
            sectionTitle: section.title,
            estimatedDuration: section.estimatedDuration,
            totalUsersInProgress: progressStats[0]?.totalUsers || 0,
            completionRate: progressStats[0] ? 
                Math.round((progressStats[0].completedUsers / progressStats[0].totalUsers) * 100) : 0,
            averageTimeSpent: Math.round(progressStats[0]?.avgTimeSpent || 0),
            averageCompletionPercentage: Math.round(progressStats[0]?.avgCompletionPercentage || 0),
            totalViews: progressStats[0]?.totalViews || 0
        };
        
        res.json({ 
            success: true, 
            data: analytics 
        });
    } catch (error) {
        console.error('Get section analytics error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    createSection,
    getSection,
    updateSection,
    deleteSection,
    reorderSections,
    duplicateSection,
    getSectionProgress,
    updateSectionProgress,
    updateSectionProgressBatch,
    getSectionProgressLogs,
    getSectionAnalytics
};
