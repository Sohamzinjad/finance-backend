const { errorResponse } = require('../utils/response');

/**
 * Role-based access control middleware factory.
 * @param {...string} roles - Allowed roles (e.g. 'ADMIN', 'ANALYST')
 * @returns Express middleware function
 *
 * Usage: router.get('/admin', authenticate, requireRole('ADMIN'), handler)
 *        router.get('/reports', authenticate, requireRole('ADMIN', 'ANALYST'), handler)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Forbidden: insufficient permissions. Required roles: ${roles.join(', ')}`,
        403
      );
    }

    next();
  };
};

module.exports = requireRole;
