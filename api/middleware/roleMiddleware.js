// middleware/roleMiddleware.js
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // Assuming req.user is populated after authentication middleware runs
    const userRole = req?.user?.role; 
    if (allowedRoles.includes(userRole?.name)) {
      next(); // User has permission, continue to the route handler
    } else {
      res.status(403).send('Forbidden: Insufficient permissions'); // Deny access
    }
  };
};

module.exports = { authorize };
