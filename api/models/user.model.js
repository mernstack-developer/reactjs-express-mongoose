const mongoose = require('mongoose');
//const { ROLES_MAP } = require('../../config/rolesConfig');

const UserSchema = new mongoose.Schema({
	firstname: { type: String, required: true },
	lastname: { type: String, required: true },
	phone: { type: String },
	email: { type: String, required: true, unique: true, index: true },
	bio: { type: String },
	password: { type: String, required: true },
	//role: { type: String, default: 'user' },
	// This links the User model to the Role model
	role: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Role',
		required: true,
	},
	registeredCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

}, { timestamps: true });

// Remove sensitive fields when converting to JSON
UserSchema.methods.toJSON = function () {
	const obj = this.toObject();
	delete obj.password;
	return obj;
};

module.exports = mongoose.model('User', UserSchema);
