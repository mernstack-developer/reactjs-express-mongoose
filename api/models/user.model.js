const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true, index: true },
	password: { type: String, required: true },
	role: { type: String, default: 'user' },
}, { timestamps: true });

// Remove sensitive fields when converting to JSON
UserSchema.methods.toJSON = function () {
	const obj = this.toObject();
	delete obj.password;
	return obj;
};

module.exports = mongoose.model('User', UserSchema);
