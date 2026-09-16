exports.up = function (knex) {
  return knex.schema.createTable('sales_order_items', (table) => {
    table.increments('id').primary();
    table
      .integer('sales_order_id')
      .notNullable()
      .references('id')
      .inTable('sales_orders')
      .onDelete('CASCADE');
    table
      .integer('product_id')
      .notNullable()
      .references('id')
      .inTable('products');
    table.integer('quantity').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('sales_order_items');
};
