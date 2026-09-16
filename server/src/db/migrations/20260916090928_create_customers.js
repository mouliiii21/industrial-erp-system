exports.up = function (knex) {
  return knex.schema.createTable('customers', (table) => {
    table.increments('id').primary();
    table.string('company_name').notNullable();
    table.string('contact_person').notNullable();
    table.string('mobile').notNullable();
    table.string('email');
    table.string('city');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('customers');
};
