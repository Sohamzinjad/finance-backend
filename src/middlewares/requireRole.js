const { errorResponse } = require('../utils/response');

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }
    
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Forbidden: Insufficient privileges', 403);
    }
    
    next();
  };
};

module.exports = requireRole;
