exports.up = function (knex) {
  return knex.schema.createTable('dispatch_items', (table) => {
    table.increments('id').primary();
    table
      .integer('dispatch_id')
      .notNullable()
      .references('id')
      .inTable('dispatches')
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
  return knex.schema.dropTableIfExists('dispatch_items');
};
