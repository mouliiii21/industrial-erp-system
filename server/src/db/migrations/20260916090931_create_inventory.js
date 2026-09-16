// Available quantity is always derived (physical_qty - reserved_qty),
// never stored, so it can never drift out of sync.
exports.up = function (knex) {
  return knex.schema.createTable('inventory', (table) => {
    table.increments('id').primary();
    table
      .integer('product_id')
      .notNullable()
      .unique()
      .references('id')
      .inTable('products')
      .onDelete('CASCADE');
    table.integer('physical_qty').notNullable().defaultTo(0);
    table.integer('reserved_qty').notNullable().defaultTo(0);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('inventory');
};
