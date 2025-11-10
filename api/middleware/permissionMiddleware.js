//const { ROLES_MAP } = require('../config/permissions');

// Middleware that accepts a single required permission
const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    // 1. Assuming req.user is populated from a prior auth middleware
   // const userRole = req.user.role; 

    // 2. Look up the permissions associated with the user's role
   // const userPermissions = ROLES_MAP[userRole] || [];
    const userPermissions = req?.user?.permissions || [];

    // 3. Check if the required permission is in the user's set of permissions
    if (userPermissions.includes(requiredPermission)) {
      next(); // User is authorized
    } else {
      res.status(403).send('Forbidden: Insufficient permissions for this action.');
    }
  };
};

module.exports = { requirePermission };