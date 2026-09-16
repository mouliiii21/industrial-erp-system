exports.up = function (knex) {
  return knex.schema.createTable('dispatches', (table) => {
    table.increments('id').primary();
    table.string('dispatch_number').notNullable().unique();
    table
      .integer('sales_order_id')
      .notNullable()
      .references('id')
      .inTable('sales_orders');
    table.timestamp('dispatch_date').defaultTo(knex.fn.now());
    table.string('vehicle_number').notNullable();
    table.string('driver_name').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('dispatches');
};
