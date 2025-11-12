const courseService = require('../services/course.service');

async function createCourse(req, res) {
    try {
        const course = await courseService.createCourse(req.body);
        res.status(201).json({ data: course });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}   
async function getCourses(req, res) {
    try {
        const courses = await courseService.getCourses();
        res.json({ data: courses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}   
async function getCourseById(req, res) {
    try {
        const course = await courseService.getCourseById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ data: course });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}   
async function updateCourse(req, res) {
    try {
        const course = await courseService.updateCourse(req.params.id, req.body);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}   
async function deleteCourse(req, res) {
    try {
        const course = await courseService.deleteCourse(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function getCoursesByUser(req, res) {
    try {
        const userId = req.params.userId;
        const courses = await courseService.getCoursesByUser(userId);
        res.json({ data: courses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function registerUserForCourse(req, res) {
    try {
        const { userId, courseId } = req.body;
console.log(userId, courseId);
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const course = await courseService.getCourseById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        await courseService.registerUserForCourse(userId, courseId);

        res.status(200).json({ message: 'User registered for course successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createCourse,
    getCourses,
    getCourseById,
    registerUserForCourse,
    updateCourse,
    deleteCourse,
    getCoursesByUser
};