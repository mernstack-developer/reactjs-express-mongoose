const courseService = require('../services/course.service');

/**
 * Get public courses (publicly available)
 * No authentication required
 */
async function getPublicCourses(req, res) {
    try {
        const courses = await courseService.getPublicCourses();
        res.json({ data: courses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * Update course enrollment settings (admin only)
 * Can update: isPublic, enrollmentType, price, maxStudents, enrollmentDeadline, etc.
 */
async function updateEnrollmentSettings(req, res) {
    try {
        const { id } = req.params;
        const { isPublic, enrollmentType, price, maxStudents, enrollmentDeadline, startDate, endDate, tags } = req.body;

        // Validate enrollmentType
        const validTypes = ['free', 'paid', 'approval'];
        if (enrollmentType && !validTypes.includes(enrollmentType)) {
            return res.status(400).json({ 
                error: 'Invalid enrollmentType. Must be one of: free, paid, approval' 
            });
        }

        // Validate price for paid courses
        if (enrollmentType === 'paid' && (!price || price <= 0)) {
            return res.status(400).json({ 
                error: 'Price is required for paid courses and must be greater than 0' 
            });
        }

        const updateData = {
            isPublic,
            enrollmentType,
            price: enrollmentType === 'paid' ? price : 0,
            maxStudents,
            enrollmentDeadline,
            startDate,
            endDate,
            tags,
            requiresPayment: enrollmentType === 'paid'
        };

        const course = await courseService.updateCourse(id, updateData);
        
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json({ 
            data: course,
            message: 'Enrollment settings updated successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * Get course enrollment status for a user
 */
async function getEnrollmentStatus(req, res) {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const course = await courseService.getCourseById(courseId);
        
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const isEnrolled = course.registeredUsers.includes(userId);
        const canEnroll = course.isPublic && course.enrollmentType === 'free';
        const requiresPayment = course.enrollmentType === 'paid';
        const requiresApproval = course.enrollmentType === 'approval';
        const spotsAvailable = !course.maxStudents || course.registeredUsers.length < course.maxStudents;
        const deadlineReached = course.enrollmentDeadline && new Date() > new Date(course.enrollmentDeadline);

        res.json({
            data: {
                courseId,
                isEnrolled,
                canEnroll: canEnroll && spotsAvailable && !deadlineReached,
                requiresPayment,
                requiresApproval,
                enrollmentType: course.enrollmentType,
                price: course.price,
                currency: course.currency,
                spotsAvailable,
                deadlineReached,
                enrolledCount: course.registeredUsers.length,
                maxStudents: course.maxStudents
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * Self-register a user for a free public course
 * User must be authenticated
 */
async function selfEnroll(req, res) {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const course = await courseService.getCourseById(courseId);
        
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if course allows self-enrollment
        if (!course.isPublic) {
            return res.status(403).json({ error: 'This course is not publicly available' });
        }

        if (course.enrollmentType !== 'free') {
            return res.status(403).json({ 
                error: 'This course requires payment or admin approval. Self-enrollment is not allowed.' 
            });
        }

        // Check enrollment deadline
        if (course.enrollmentDeadline && new Date() > new Date(course.enrollmentDeadline)) {
            return res.status(403).json({ error: 'Enrollment deadline has passed' });
        }

        // Check max students
        if (course.maxStudents && course.registeredUsers.length >= course.maxStudents) {
            return res.status(403).json({ error: 'This course is full. No more enrollments allowed.' });
        }

        // Check if already enrolled
        if (course.registeredUsers.includes(userId)) {
            return res.status(400).json({ error: 'You are already enrolled in this course' });
        }

        // Enroll user
        const updatedCourse = await courseService.registerUserForCourse(userId, courseId);

        res.json({
            data: updatedCourse,
            message: 'Successfully enrolled in the course'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * Unenroll a user from a course
 * User can unenroll from their own courses
 * Admin can unenroll any user
 */
async function unenroll(req, res) {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin'; // Adjust based on your auth system

        // Admin can unenroll any user, students can only unenroll themselves
        const targetUserId = req.body.userId || userId;
        
        if (!isAdmin && targetUserId !== userId) {
            return res.status(403).json({ error: 'You can only unenroll yourself' });
        }

        const updatedCourse = await courseService.unregisterUserFromCourse(targetUserId, courseId);

        if (!updatedCourse) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json({
            data: updatedCourse,
            message: 'Successfully unenrolled from the course'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getPublicCourses,
    updateEnrollmentSettings,
    getEnrollmentStatus,
    selfEnroll,
    unenroll
};
