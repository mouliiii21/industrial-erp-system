const db = require('../db');

async function listProducts() {
  return db('products').select('*').orderBy('id');
}

module.exports = { listProducts };
