const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Missing or invalid Authorization header', 401));
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyToken(token);
    req.user = payload; // { id, role, email }
    next();
  } catch (err) {
    next(new AppError('Invalid or expired token', 401));
  }
}

module.exports = authenticate;
