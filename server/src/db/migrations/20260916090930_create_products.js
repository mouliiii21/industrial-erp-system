exports.up = function (knex) {
  return knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('product_code').notNullable().unique();
    table.string('name').notNullable();
    table.string('category').notNullable();
    table.string('unit').notNullable();
    table.decimal('base_price', 12, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('products');
};
