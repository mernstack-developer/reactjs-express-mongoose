const Course = require('../models/course.model');

async function createCourse(data) {
    const course = new Course(data);
    return await course.save();
}   
async function getCourses() {
    return await Course.find().lean();
}   
async function getCourseById(id) {
    return await Course.findById(id).lean();
}   
async function updateCourse(id, data) {
    return await Course.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}   
async function deleteCourse(id) {
    return await Course.findByIdAndDelete(id).lean();
}

module.exports = {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
};