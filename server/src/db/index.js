const knexLib = require('knex');
const knexConfig = require('../../knexfile');

const env = process.env.NODE_ENV || 'development';
const db = knexLib(knexConfig[env]);

module.exports = db;
