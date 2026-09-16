const db = require('../db');
const { comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

async function login(email, password) {
  const user = await db('users').where({ email }).first();
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

module.exports = { login };
