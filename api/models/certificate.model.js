const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true,
    index: true
  },
  studentName: { type: String, required: true },
  courseTitle: { type: String, required: true },
  instructorName: { type: String, required: true },
  completionDate: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  score: { type: Number, min: 0, max: 100 }, // Optional score
  grade: { 
    type: String, 
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    required: false
  },
  
  // Certificate metadata
  certificateId: { 
    type: String, 
    unique: true,
    required: true
  },
  qrCode: { type: String }, // QR code data for verification
  verificationUrl: { type: String },
  
  // Performance metrics
  totalTimeSpent: { type: Number, default: 0 }, // In seconds
  completionPercentage: { type: Number, min: 0, max: 100, required: true },
  sectionsCompleted: { type: Number, default: 0 },
  totalSections: { type: Number, default: 0 },
  
  // Certificate status
  isActive: { type: Boolean, default: true },
  isDownloaded: { type: Boolean, default: false },
  downloadCount: { type: Number, default: 0 },
  
  // Additional fields
  notes: { type: String },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better query performance
CertificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true }); // One certificate per student per course
CertificateSchema.index({ certificateId: 1 }, { unique: true });
CertificateSchema.index({ completionDate: -1 });
CertificateSchema.index({ isActive: 1 });

// Pre-save middleware to generate certificate ID
CertificateSchema.pre('save', function(next) {
  if (this.isNew && !this.certificateId) {
    this.certificateId = `CERT-${Date.now()}-${this.studentId.toString().slice(-6)}`.toUpperCase();
  }
  this.updatedAt = new Date();
  next();
});

// Static method to generate certificate
CertificateSchema.statics.generateCertificate = async function(studentId, courseId, options = {}) {
  const Course = mongoose.model('Course');
  const User = mongoose.model('User');
  const Enrollment = mongoose.model('Enrollment');
  const SectionProgress = mongoose.model('SectionProgress');
  
  const student = await User.findById(studentId);
  const course = await Course.findById(courseId).populate('instructorId');
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  
  if (!student || !course || !enrollment || !enrollment.isCompleted) {
    throw new Error('Cannot generate certificate: student not eligible');
  }
  
  // Calculate course progress
  const sections = await mongoose.model('Section').find({ courseId });
  let totalTimeSpent = 0;
  let sectionsCompleted = 0;
  let totalDurationWatched = 0;
  
  for (const section of sections) {
    const progress = await SectionProgress.findOne({ 
      userId: studentId, 
      sectionId: section._id 
    }).sort({ lastActivityAt: -1 });
    
    if (progress) {
      totalTimeSpent += progress.timeSpent;
      totalDurationWatched += progress.durationWatched;
      if (progress.isCompleted) {
        sectionsCompleted++;
      }
    }
  }
  
  const completionPercentage = sections.length > 0 ? 
    Math.round((sectionsCompleted / sections.length) * 100) : 0;
  
  // Calculate grade based on completion percentage and score
  let grade = 'B';
  if (completionPercentage >= 95 || (options.score && options.score >= 95)) {
    grade = 'A+';
  } else if (completionPercentage >= 90 || (options.score && options.score >= 90)) {
    grade = 'A';
  } else if (completionPercentage >= 85 || (options.score && options.score >= 85)) {
    grade = 'B+';
  } else if (completionPercentage >= 80 || (options.score && options.score >= 80)) {
    grade = 'B';
  } else if (completionPercentage >= 75 || (options.score && options.score >= 75)) {
    grade = 'C+';
  } else if (completionPercentage >= 70 || (options.score && options.score >= 70)) {
    grade = 'C';
  } else if (completionPercentage >= 65 || (options.score && options.score >= 65)) {
    grade = 'D';
  } else {
    grade = 'F';
  }
  
  // Generate QR code data
  const qrCodeData = JSON.stringify({
    certificateId: '', // Will be filled after save
    studentId: student._id,
    courseId: course._id,
    completionDate: new Date().toISOString(),
    verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-certificate/`
  });
  
  // Create certificate
  const certificate = new Certificate({
    studentId,
    courseId,
    studentName: `${student.firstname} ${student.lastname}`,
    courseTitle: course.title,
    instructorName: course.instructorId ? `${course.instructorId.firstname} ${course.instructorId.lastname}` : 'Instructor',
    completionDate: enrollment.completedAt || new Date(),
    score: options.score,
    grade,
    totalTimeSpent,
    completionPercentage,
    sectionsCompleted,
    totalSections: sections.length,
    notes: options.notes || '',
    qrCode: qrCodeData,
    verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-certificate/${''}` // Will be filled after save
  });
  
  await certificate.save();
  
  // Update QR code with actual certificate ID
  certificate.qrCode = qrCodeData.replace('', certificate.certificateId);
  certificate.verificationUrl = certificate.verificationUrl.replace('', certificate.certificateId);
  await certificate.save();
  
  return certificate;
};

// Static method to verify certificate
CertificateSchema.statics.verifyCertificate = async function(certificateId) {
  const certificate = await Certificate.findOne({ 
    certificateId, 
    isActive: true 
  }).populate('studentId').populate('courseId');
  
  if (!certificate) {
    return { valid: false, message: 'Certificate not found or inactive' };
  }
  
  return {
    valid: true,
    certificate: {
      id: certificate.certificateId,
      studentName: certificate.studentName,
      courseTitle: certificate.courseTitle,
      instructorName: certificate.instructorName,
      completionDate: certificate.completionDate,
      grade: certificate.grade,
      score: certificate.score,
      verificationUrl: certificate.verificationUrl
    }
  };
};

// Instance method to download certificate
CertificateSchema.methods.download = async function(format = 'pdf') {
  // This would integrate with a PDF generation service
  // For now, return basic certificate data
  return {
    format: format,
    data: {
      certificateId: this.certificateId,
      studentName: this.studentName,
      courseTitle: this.courseTitle,
      instructorName: this.instructorName,
      completionDate: this.completionDate,
      grade: this.grade,
      score: this.score,
      qrCode: this.qrCode
    }
  };
};

// Instance method to increment download count
CertificateSchema.methods.incrementDownloadCount = async function() {
  this.downloadCount += 1;
  this.isDownloaded = true;
  return await this.save();
};

// Virtual for certificate URL
CertificateSchema.virtual('certificateUrl').get(function() {
  return `${process.env.FRONTEND_URL || 'http://localhost:5173'}/certificates/${this.certificateId}`;
});

// Ensure virtual fields are serialized
CertificateSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Certificate', CertificateSchema);