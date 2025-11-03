const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: String, required: false },
    duration: { type: Number, required: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Course', courseSchema);
