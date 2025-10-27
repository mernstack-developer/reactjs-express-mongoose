const userService = require('../services/user.service');

async function createUser(req, res) {
	try {
		const user = await userService.createUser(req.body);
		res.status(201).json(user);
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: err.message });
	}
}

async function getUsers(req, res) {
	try {
		const users = await userService.getUsers();
		res.json({ data: users });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
}

async function getUserById(req, res) {
	try {
		const user = await userService.getUserById(req.params.id);
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({ data: user });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
}

async function updateUser(req, res) {
	try {
		const user = await userService.updateUser(req.params.id, req.body);
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json(user);
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: err.message });
	}
}

async function deleteUser(req, res) {
	try {
		const user = await userService.deleteUser(req.params.id);
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({ message: 'User deleted' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
}

module.exports = {
	createUser,
	getUsers,
	getUserById,
	updateUser,
	deleteUser,
};
