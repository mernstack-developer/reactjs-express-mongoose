const User = require('../models/user.model');

async function createUser(data) {
	const user = new User(data);
	return await user.save();
}

async function getUsers() {
	return await User.find().lean();
}

async function getUserById(id) {
	return await User.findById(id).lean();
}

async function updateUser(id, data) {
	return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

async function deleteUser(id) {
	return await User.findByIdAndDelete(id).lean();
}
async function getAssignmentsForUser(userId) {
	// Populate registeredCourses and their activities to get assignments
	const user = await User.findById(userId)
		.populate({
			path: 'registeredCourses',
			populate: {
				path: 'sections',
				populate: {
					path: 'activities',
					match: { type: 'assignment' }
				}
			}
		})
		.lean();

	// Extract assignments from populated activities
	const assignments = [];
	if (user && user.registeredCourses) {
		for (const course of user.registeredCourses) {
			if (course.sections) {
				for (const section of course.sections) {
					if (section.activities) {
						for (const activity of section.activities) {
							if (activity.type === 'assignment' && activity.config && activity.config.assignmentId) {
								try {
									// Import Assignment model dynamically to avoid circular dependencies
									const Assignment = require('../models/assignment.model');
									const assignment = await Assignment.findById(activity.config.assignmentId).lean();
									
									if (assignment) {
										assignments.push({
											...assignment,
											courseId: course._id,
											courseTitle: course.title,
											sectionId: section._id,
											sectionTitle: section.title,
											activityId: activity._id,
											activityTitle: activity.title,
											activityDescription: activity.description
										});
									}
								} catch (error) {
									console.error('Error fetching assignment:', error);
								}
							}
						}
					}
				}
			}
		}
	}

	return assignments;
}	
module.exports = {
	createUser,
	getUsers,
	getUserById,
	updateUser,
	deleteUser,
	getAssignmentsForUser
};
