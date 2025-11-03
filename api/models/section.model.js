const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
   contents:[{
    type: { type: String, enum: ['video', 'text', 'quiz'], required: true },
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  textBody: { type: String, required: true },
  quizData: { type: String, required: true }
}],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model('Section', SectionSchema);