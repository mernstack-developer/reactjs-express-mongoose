// config/permissions.js or similar file on the Backend (Node.js)
const PERMISSIONS = {
  VIEW_COURSE: 'view_course',
  EDIT_COURSE: 'edit_course',
  DELETE_COURSE: 'delete_course',
  ENROLL_STUDENTS: 'enroll_students',
  SUBMIT_ASSIGNMENT: 'submit_assignment',
};

const ROLES_MAP = {
  student: [PERMISSIONS.VIEW_COURSE, PERMISSIONS.SUBMIT_ASSIGNMENT],
  instructor: [PERMISSIONS.VIEW_COURSE, PERMISSIONS.EDIT_COURSE, PERMISSIONS.ENROLL_STUDENTS],
  admin: Object.values(PERMISSIONS), // Admins have all permissions
  guest: [PERMISSIONS.VIEW_COURSE],
};

module.exports = { PERMISSIONS, ROLES_MAP };
