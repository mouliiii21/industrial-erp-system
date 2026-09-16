const AppError = require('../utils/AppError');

/**
 * Usage: router.post('/x', authenticate, requireRole('ADMIN'), handler)
 * Must run after `authenticate` so req.user is populated.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}

module.exports = requireRole;
