const mongoose = require('mongoose');

const SectionProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    timeSpent: { type: Number, default: 0 }, // Total time spent in seconds
    durationWatched: { type: Number, default: 0 }, // Duration actually watched in seconds
    completionPercentage: { type: Number, default: 0 }, // 0-100 percentage
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    lastActivityAt: { type: Date, default: Date.now },
    progressLogs: [{
        timestamp: { type: Date, default: Date.now },
        timeSpent: { type: Number, default: 0 },
        durationWatched: { type: Number, default: 0 },
        completionPercentage: { type: Number, default: 0 }
    }]
}, { timestamps: true });

const SectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: false, default: '' },
    isHidden: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    
    // Duration and completion tracking
    estimatedDuration: { type: Number, default: 0 }, // Estimated duration in seconds
    minimumDuration: { type: Number, default: 0 }, // Minimum duration required for completion in seconds
    
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
  quizData: { type: mongoose.Schema.Types.Mixed, required: false },
  estimatedDuration: { type: Number, default: 0 } // Duration for this specific content
}],
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
  
  // Progress tracking
  completionCriteria: {
    type: { type: String, enum: ['time-based', 'quiz-completion', 'content-completion'], default: 'time-based' },
    minimumCompletionPercentage: { type: Number, default: 80 }, // Minimum % to mark as complete
    requireQuizPass: { type: Boolean, default: false },
    quizPassPercentage: { type: Number, default: 70 }
  },
  
  // Statistics
  totalViews: { type: Number, default: 0 },
  completionCount: { type: Number, default: 0 },
  averageCompletionTime: { type: Number, default: 0 }, // In seconds
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date, default: null }
});

// Indexes for better query performance
SectionSchema.index({ courseId: 1, order: 1 });
SectionSchema.index({ 'completionCriteria.type': 1 });

// Static method to get section progress for a user
SectionSchema.statics.getProgressForUser = async function(sectionId, userId) {
  const SectionProgress = mongoose.model('SectionProgress');
  return await SectionProgress.findOne({ 
    sectionId, 
    userId 
  }).sort({ lastActivityAt: -1 });
};

// Static method to update section progress
SectionSchema.statics.updateProgress = async function(sectionId, userId, timeSpent, durationWatched) {
  const SectionProgress = mongoose.model('SectionProgress');
  const section = await this.findById(sectionId);
  
  if (!section) {
    throw new Error('Section not found');
  }
  
  let progress = await SectionProgress.findOne({ sectionId, userId });
  
  if (!progress) {
    progress = new SectionProgress({
      userId,
      sectionId,
      timeSpent: 0,
      durationWatched: 0
    });
  }
  
  // Update time tracking
  progress.timeSpent += timeSpent || 0;
  progress.durationWatched += durationWatched || 0;
  
  // Calculate completion percentage
  const totalEstimatedDuration = section.estimatedDuration || 
    section.contents.reduce((total, content) => total + (content.estimatedDuration || 0), 0);
  
  let completionPercentage = 0;
  if (totalEstimatedDuration > 0) {
    completionPercentage = Math.min(100, (progress.durationWatched / totalEstimatedDuration) * 100);
  }
  
  progress.completionPercentage = Math.round(completionPercentage);
  
  // Check if section is completed
  const criteria = section.completionCriteria;
  let isCompleted = false;
  
  if (criteria.type === 'time-based') {
    isCompleted = progress.completionPercentage >= criteria.minimumCompletionPercentage;
  } else if (criteria.type === 'content-completion') {
    isCompleted = progress.completionPercentage >= criteria.minimumCompletionPercentage;
  }
  
  if (isCompleted && !progress.isCompleted) {
    progress.isCompleted = true;
    progress.completedAt = new Date();
  }
  
  // Add progress log every 5 seconds
  const now = new Date();
  const lastLog = progress.progressLogs[progress.progressLogs.length - 1];
  if (!lastLog || (now - new Date(lastLog.timestamp)) >= 5000) { // 5 seconds
    progress.progressLogs.push({
      timestamp: now,
      timeSpent: progress.timeSpent,
      durationWatched: progress.durationWatched,
      completionPercentage: progress.completionPercentage
    });
    
    // Keep only last 100 logs to prevent document size from growing too large
    if (progress.progressLogs.length > 100) {
      progress.progressLogs = progress.progressLogs.slice(-100);
    }
  }
  
  progress.lastActivityAt = now;
  await progress.save();
  
  return progress;
};

// Instance method to get completion status
SectionSchema.methods.getCompletionStatus = function(userId) {
  return this.constructor.getProgressForUser(this._id, userId);
};

// Pre-save middleware to update timestamps
SectionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const SectionProgress = mongoose.model('SectionProgress', SectionProgressSchema);
const Section = mongoose.model('Section', SectionSchema);

module.exports = { Section, SectionProgress };