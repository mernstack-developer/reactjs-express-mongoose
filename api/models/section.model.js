const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: false, default: '' },
    isHidden: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    parentSection: { type: String, required: false }, // ID of parent section for hierarchical structure
    media: {
        type: { type: String, enum: ['video', 'image'], required: false },
        url: { type: String, required: false },
        thumbnail: { type: String, required: false },
        alt: { type: String, required: false }
    },
   contents:[{
    type: { type: String, enum: ['video', 'text', 'quiz'], required: false },
  title: { type: String, required: false },
  videoUrl: { type: String, required: false },
  textBody: { type: String, required: false },
  quizData: { type: mongoose.Schema.Types.Mixed, required: false }
}],
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model('Section', SectionSchema);