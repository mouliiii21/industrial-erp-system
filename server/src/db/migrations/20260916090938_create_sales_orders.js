// quotation_id is UNIQUE: this single constraint is what guarantees a
// quotation can never generate two sales orders, enforced by Postgres
// itself rather than relying on an application-level check.
exports.up = function (knex) {
  return knex.schema.createTable('sales_orders', (table) => {
    table.increments('id').primary();
    table.string('order_number').notNullable().unique();
    table
      .integer('customer_id')
      .notNullable()
      .references('id')
      .inTable('customers');
    table
      .integer('quotation_id')
      .notNullable()
      .unique()
      .references('id')
      .inTable('quotations');
    table.timestamp('order_date').defaultTo(knex.fn.now());
    table
      .enu('status', ['PENDING', 'CONFIRMED', 'DISPATCHED', 'CANCELLED'])
      .notNullable()
      .defaultTo('PENDING');
    table.decimal('total_amount', 12, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('sales_orders');
};
