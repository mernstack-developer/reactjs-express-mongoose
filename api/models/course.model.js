const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: false },
    instructor: { type: String, required: false },
    duration: { type: Number, required: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
    
    // Course visibility and enrollment settings
    isPublic: { type: Boolean, default: false }, // Publicly visible on homepage
    enrollmentType: { 
        type: String, 
        enum: ['free', 'paid', 'approval'], 
        default: 'free' // 'free' = students can self-enroll, 'paid' = requires payment, 'approval' = admin approval needed
    },
    price: { type: Number, default: 0 }, // Price in USD (only for paid courses)
    currency: { type: String, default: 'USD' },
    requiresPayment: { type: Boolean, default: false }, // Deprecated - use enrollmentType instead
    maxStudents: { type: Number, default: null }, // Max enrollment (null = unlimited)
    enrollmentDeadline: { type: Date, default: null }, // Deadline for enrollment
    startDate: { type: Date, default: null }, // Course start date
    endDate: { type: Date, default: null }, // Course end date
    tags: [{ type: String }], // Course tags/categories
    thumbnail: { type: String, required: false }, // Thumbnail image URL
    // Category links
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Course', courseSchema);
