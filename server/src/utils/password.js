const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { hashPassword, comparePassword };
