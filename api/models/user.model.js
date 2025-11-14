const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	firstname: { type: String, required: true },
	lastname: { type: String, required: true },
	phone: { type: String },
	email: { type: String, required: true, unique: true, index: true },
	bio: { type: String },
	password: { type: String, required: true },
	role: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Role',
		required: true,
	},
	registeredCourses: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Course'
	}],
	// Optional profile fields
	avatarUrl: { type: String },
	social: {
		facebook: { type: String },
		x: { type: String },
		linkedin: { type: String },
		instagram: { type: String },
	},
	address: {
		street: { type: String },
		city: { type: String },
		state: { type: String },
		postalCode: { type: String },
		country: { type: String },
	},
	preferences: { type: mongoose.Schema.Types.Mixed },

}, { timestamps: true });

// Remove sensitive fields when converting to JSON
UserSchema.methods.toJSON = function () {
	const obj = this.toObject();
	delete obj.password;
	return obj;
};

module.exports = mongoose.model('User', UserSchema);
