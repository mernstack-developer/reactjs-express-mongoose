const mongoose = require('mongoose');
const Assignment = require('../models/assignment.model');
const Activity = require('../models/activity.model');
const { Section, SectionProgress } = require('../models/section.model');
const Enrollment = require('../models/enrollment.model');
const notificationService = require('./notification.service');
const Course = require('../models/course.model');

// Helper function to ensure mongoose is connected
async function ensureMongooseConnected() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Mongoose not connected. Please ensure database connection is established.');
  }
}


async function createAssignment(payload) {
  const a = new Assignment(payload);
  return await a.save();
}

async function getAssignmentById(id) {
  // First get the assignment
  const assignment = await Assignment.findById(id).lean();
  if (!assignment) return null;

  // Find the activity that references this assignment
  const Activity = require('../models/activity.model');
  const activity = await Activity.findOne({ 
    'config.assignmentId': id 
  }).lean();

  if (!activity) return assignment;

  // Find the section that contains this activity
  const Section = require('../models/section.model');
  const section = await Section.findOne({ 
    activities: activity._id 
  })
    .populate('course', 'title')
    .lean();

  // Add the section and course information to the assignment
  if (section) {
    assignment.section = {
      _id: section._id,
      title: section.title
    };
    
    if (section.course) {
      assignment.course = {
        _id: section.course._id,
        title: section.course.title
      };
    }
  }

  // Debug: Log the assignment data structure
  console.log('Assignment data structure:', {
    title: assignment.title,
    dueDate: assignment.dueDate,
    dueDateType: typeof assignment.dueDate,
    course: assignment.course,
    section: assignment.section
  });

  return assignment;
}

async function updateAssignment(id, data) {
  return await Assignment.findByIdAndUpdate(id, data, { new: true }).lean();
}

async function deleteAssignment(id) {
  return await Assignment.findByIdAndDelete(id).lean();
}

// Helper that creates an assignment and also creates an Activity entry and links to section
async function createAssignmentActivity(sectionId, payload, creatorId) {
  // Ensure mongoose is connected
  await ensureMongooseConnected();
  
  const assignment = new Assignment({ ...payload, createdBy: creatorId });
  const saved = await assignment.save();
  const activity = new Activity({ type: 'assignment', title: saved.title, config: { assignmentId: saved._id }, createdBy: creatorId });
  const savedAct = await activity.save();
  
  // Debug: Check if Section model has the required methods
  if (typeof Section.findByIdAndUpdate !== 'function') {
    console.error('❌ Section model debugging:');
    console.error('   Section type:', typeof Section);
    console.error('   Section keys:', Object.keys(Section));
    console.error('   Section.prototype keys:', Object.getOwnPropertyNames(Section.prototype));
    console.error('   mongoose connection state:', mongoose.connection.readyState);
    throw new Error('Section.findByIdAndUpdate is not a function. Model may not be properly initialized.');
  }
  
  if (sectionId) await Section.findByIdAndUpdate(sectionId, { $push: { activities: savedAct._id } });
  
  // Send notifications to enrolled students
  try {
    const section = await Section.findById(sectionId).populate('course');
    if (section && section.course) {
      const enrollments = await Enrollment.find({ courseId: section.course._id }).populate('studentId');
      
      for (const enrollment of enrollments) {
        if (enrollment.studentId) {
          await notificationService.createNotification({
            message: `New assignment "${saved.title}" has been created in ${section.course.title}`,
            recipient_id: enrollment.studentId._id.toString(),
            type: 'assignment_created',
            courseId: section.course._id,
            assignmentId: saved._id
          });
        }
      }
    }
  } catch (notificationError) {
    console.error('Failed to send notifications:', notificationError);
    // Don't fail the assignment creation if notifications fail
  }
  
  return { assignment: saved, activity: savedAct };
}

module.exports = { 
  createAssignment, 
  getAssignmentById, 
  updateAssignment, 
  deleteAssignment, 
  createAssignmentActivity 
};
