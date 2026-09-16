// Knex's schema builder has no first-class CHECK-constraint API, so these
// are added with raw SQL. They are a last line of defence: application
// code (see services/inventory.service.js) is what actually prevents
// these states, but the DB should never be able to hold invalid data
// even if a bug slips past the application layer.
exports.up = async function (knex) {
  await knex.raw(`
    ALTER TABLE inventory
      ADD CONSTRAINT chk_inventory_physical_non_negative CHECK (physical_qty >= 0),
      ADD CONSTRAINT chk_inventory_reserved_non_negative CHECK (reserved_qty >= 0),
      ADD CONSTRAINT chk_inventory_reserved_not_exceed_physical CHECK (reserved_qty <= physical_qty);
  `);

  await knex.raw(`
    ALTER TABLE products
      ADD CONSTRAINT chk_products_base_price_non_negative CHECK (base_price >= 0);
  `);

  await knex.raw(`
    ALTER TABLE enquiry_items
      ADD CONSTRAINT chk_enquiry_items_quantity_positive CHECK (quantity > 0);
  `);

  await knex.raw(`
    ALTER TABLE quotation_items
      ADD CONSTRAINT chk_quotation_items_quantity_positive CHECK (quantity > 0),
      ADD CONSTRAINT chk_quotation_items_discount_range CHECK (discount_pct >= 0 AND discount_pct <= 100),
      ADD CONSTRAINT chk_quotation_items_gst_non_negative CHECK (gst_pct >= 0);
  `);

  await knex.raw(`
    ALTER TABLE sales_order_items
      ADD CONSTRAINT chk_sales_order_items_quantity_positive CHECK (quantity > 0);
  `);

  await knex.raw(`
    ALTER TABLE dispatch_items
      ADD CONSTRAINT chk_dispatch_items_quantity_positive CHECK (quantity > 0);
  `);
};

exports.down = async function (knex) {
  await knex.raw(`ALTER TABLE inventory
    DROP CONSTRAINT IF EXISTS chk_inventory_physical_non_negative,
    DROP CONSTRAINT IF EXISTS chk_inventory_reserved_non_negative,
    DROP CONSTRAINT IF EXISTS chk_inventory_reserved_not_exceed_physical;`);
  await knex.raw(`ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_products_base_price_non_negative;`);
  await knex.raw(`ALTER TABLE enquiry_items DROP CONSTRAINT IF EXISTS chk_enquiry_items_quantity_positive;`);
  await knex.raw(`ALTER TABLE quotation_items
    DROP CONSTRAINT IF EXISTS chk_quotation_items_quantity_positive,
    DROP CONSTRAINT IF EXISTS chk_quotation_items_discount_range,
    DROP CONSTRAINT IF EXISTS chk_quotation_items_gst_non_negative;`);
  await knex.raw(`ALTER TABLE sales_order_items DROP CONSTRAINT IF EXISTS chk_sales_order_items_quantity_positive;`);
  await knex.raw(`ALTER TABLE dispatch_items DROP CONSTRAINT IF EXISTS chk_dispatch_items_quantity_positive;`);
};
