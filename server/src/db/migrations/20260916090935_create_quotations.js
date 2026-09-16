exports.up = function (knex) {
  return knex.schema.createTable('quotations', (table) => {
    table.increments('id').primary();
    table.string('quotation_number').notNullable().unique();
    table
      .integer('enquiry_id')
      .notNullable()
      .references('id')
      .inTable('enquiries');
    table
      .integer('customer_id')
      .notNullable()
      .references('id')
      .inTable('customers');
    table.date('valid_until');
    table
      .enu('status', ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'])
      .notNullable()
      .defaultTo('DRAFT');
    table.decimal('grand_total', 12, 2).notNullable().defaultTo(0);
    table.integer('created_by_id').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('quotations');
};
