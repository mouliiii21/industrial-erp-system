exports.up = function (knex) {
  return knex.schema.createTable('enquiry_items', (table) => {
    table.increments('id').primary();
    table
      .integer('enquiry_id')
      .notNullable()
      .references('id')
      .inTable('enquiries')
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
  return knex.schema.dropTableIfExists('enquiry_items');
};
