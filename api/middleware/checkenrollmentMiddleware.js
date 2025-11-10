// Middleware to check if the user is enrolled in the specific course
const checkEnrollment = async (req, res, next) => {
  const { id: courseId } = req.params;
  // Assuming req.user is available after authentication middleware runs
  const userId = req.user._id; 

  const course = await Course.findById(courseId);

  if (!course) {
    return res.status(404).send('Course not found');
  }

  // Check if the user ID is in the course's registeredUsers array
  const isEnrolled = course.registeredUsers.includes(userId);

  if (isEnrolled || req.user.role === 'admin' || req.user.role === 'instructor') {
    // Attach the course object to the request for the next handler to use
    req.course = course; 
    next(); // Proceed to the route handler
  } else {
    res.status(403).send('Forbidden: You are not enrolled in this course.');
  }
};
module.exports = { checkEnrollment };