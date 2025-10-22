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

module.exports = {
	createUser,
	getUsers,
	getUserById,
	updateUser,
	deleteUser,
};
