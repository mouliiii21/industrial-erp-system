require('dotenv').config();

const base = {
  client: 'pg',
  migrations: {
    directory: './src/db/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './src/db/seeds',
  },
};

module.exports = {
  development: {
    ...base,
    connection: process.env.DATABASE_URL,
  },
  test: {
    ...base,
    connection: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
  },
  production: {
    ...base,
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
  },
};
