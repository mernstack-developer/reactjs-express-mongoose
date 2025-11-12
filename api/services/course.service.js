const Course = require('../models/course.model');

async function createCourse(data) {
    const course = new Course(data);
    return await course.save();
}   
async function getCourses() {
    return await Course.find().lean();
}   
async function getCourseById(id) {
    // Populate sections and nested activities so callers receive full section objects
    // but keep other list endpoints lightweight.
    return await Course.findById(id)
        .populate({
            path: 'sections',
            // populate activities inside each section if present
            populate: { path: 'activities' }
        })
        .lean();
}   
async function updateCourse(id, data) {
    return await Course.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}   
async function deleteCourse(id) {
    return await Course.findByIdAndDelete(id).lean();
}

// Section-related helpers
async function addSectionToCourse(courseId, sectionId) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');
    course.sections = course.sections || [];
    course.sections.push(sectionId);
    await course.save();
    return course;
}

async function removeSectionFromCourse(courseId, sectionId) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');
    course.sections = (course.sections || []).filter(id => id.toString() !== sectionId.toString());
    await course.save();
    return course;
}

async function reorderSections(courseId, orderedSectionIds) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');
    // Ensure only existing section ids are stored and keep provided order
    course.sections = orderedSectionIds;
    await course.save();
    return course;
}

// Public courses - courses that are visible to everyone
async function getPublicCourses() {
    return await Course.find({ isPublic: true })
        .select('-registeredUsers') // Don't return user IDs in public view
        .lean();
}

// Register a user for a course
async function registerUserForCourse(userId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');
    
    // Check if already registered
    if (!course.registeredUsers.includes(userId)) {
        course.registeredUsers.push(userId);
        await course.save();
    }
    
    return await Course.findById(courseId)
        .populate({
            path: 'sections',
            populate: { path: 'activities' }
        })
        .lean();
}

// Unregister a user from a course
async function unregisterUserFromCourse(userId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');
    
    course.registeredUsers = course.registeredUsers.filter(
        id => id.toString() !== userId.toString()
    );
    await course.save();
    
    return await Course.findById(courseId).lean();
}

module.exports = {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    addSectionToCourse,
    removeSectionFromCourse,
    reorderSections,
    getPublicCourses,
    registerUserForCourse,
    unregisterUserFromCourse,
};