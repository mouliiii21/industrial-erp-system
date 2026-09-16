exports.up = function (knex) {
  return knex.schema.createTable('enquiries', (table) => {
    table.increments('id').primary();
    table.string('enquiry_number').notNullable().unique();
    table
      .integer('customer_id')
      .notNullable()
      .references('id')
      .inTable('customers');
    table.timestamp('enquiry_date').defaultTo(knex.fn.now());
    table.date('required_date');
    table.text('notes');
    table
      .enu('status', ['NEW', 'QUOTED', 'WON', 'LOST'])
      .notNullable()
      .defaultTo('NEW');
    table.integer('created_by_id').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('enquiries');
};
