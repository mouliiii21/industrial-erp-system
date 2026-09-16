exports.up = function (knex) {
  return knex.schema.createTable('quotation_items', (table) => {
    table.increments('id').primary();
    table
      .integer('quotation_id')
      .notNullable()
      .references('id')
      .inTable('quotations')
      .onDelete('CASCADE');
    table
      .integer('product_id')
      .notNullable()
      .references('id')
      .inTable('products');
    table.integer('quantity').notNullable();
    table.decimal('unit_price', 12, 2).notNullable();
    table.decimal('discount_pct', 5, 2).notNullable().defaultTo(0);
    table.decimal('gst_pct', 5, 2).notNullable().defaultTo(0);
    table.decimal('line_amount', 12, 2).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('quotation_items');
};
