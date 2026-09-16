const { hashPassword } = require('../../utils/password');

/** @param {import('knex').Knex} knex */
exports.seed = async function (knex) {
  // TRUNCATE ... RESTART IDENTITY (not .del()) so re-running the seed is
  // truly idempotent: DELETE removes rows but leaves Postgres's
  // auto-increment sequences wherever they were, so IDs would keep
  // drifting upward on every reseed. CASCADE handles FK-dependent tables
  // in one statement regardless of order.
  await knex.raw(`
    TRUNCATE TABLE
      dispatch_items, dispatches,
      sales_order_items, sales_orders,
      quotation_items, quotations,
      enquiry_items, enquiries,
      inventory, products,
      customers, users
    RESTART IDENTITY CASCADE
  `);

  const [adminPasswordHash, salesPasswordHash] = await Promise.all([
    hashPassword('Admin@123'),
    hashPassword('Sales@123'),
  ]);

  await knex('users').insert([
    { name: 'Admin User', email: 'admin@erp.test', password_hash: adminPasswordHash, role: 'ADMIN' },
    { name: 'Sales User', email: 'sales@erp.test', password_hash: salesPasswordHash, role: 'SALES' },
  ]);

  const customerRows = await knex('customers')
    .insert([
      {
        company_name: 'ABC Engineering Pvt. Ltd.',
        contact_person: 'Rakesh Sharma',
        mobile: '9811100001',
        email: 'purchase@abcengineering.test',
        city: 'Jaipur',
      },
      {
        company_name: 'Vikram Industrial Supplies',
        contact_person: 'Vikram Singh',
        mobile: '9811100002',
        email: 'orders@vikramindustrial.test',
        city: 'Ahmedabad',
      },
      {
        company_name: 'Nova Manufacturing Co.',
        contact_person: 'Priya Nair',
        mobile: '9811100003',
        email: 'procurement@novamfg.test',
        city: 'Pune',
      },
    ])
    .returning('id');

  const productRows = await knex('products')
    .insert([
      { product_code: 'IND-A-001', name: 'Industrial Product A', category: 'Fasteners', unit: 'PCS', base_price: 45.0 },
      { product_code: 'IND-B-002', name: 'Industrial Product B', category: 'Bearings', unit: 'PCS', base_price: 220.5 },
      { product_code: 'IND-C-003', name: 'Industrial Product C', category: 'Hydraulics', unit: 'PCS', base_price: 1350.0 },
      { product_code: 'IND-D-004', name: 'Industrial Product D', category: 'Valves', unit: 'PCS', base_price: 890.75 },
      { product_code: 'IND-E-005', name: 'Industrial Product E', category: 'Lubricants', unit: 'LTR', base_price: 310.0 },
      { product_code: 'IND-F-006', name: 'Industrial Product F', category: 'Safety Equipment', unit: 'PCS', base_price: 175.25 },
    ])
    .returning('id');

  const productIds = productRows.map((r) => r.id);

  await knex('inventory').insert([
    { product_id: productIds[0], physical_qty: 500, reserved_qty: 60 },
    { product_id: productIds[1], physical_qty: 300, reserved_qty: 40 },
    { product_id: productIds[2], physical_qty: 120, reserved_qty: 20 },
    { product_id: productIds[3], physical_qty: 200, reserved_qty: 0 },
    { product_id: productIds[4], physical_qty: 400, reserved_qty: 50 },
    { product_id: productIds[5], physical_qty: 250, reserved_qty: 10 },
  ]);

  console.log('Seed complete:');
  console.log(`  Admin login -> admin@erp.test / Admin@123`);
  console.log(`  Sales login -> sales@erp.test / Sales@123`);
  console.log(`  Customers seeded: ${customerRows.length}`);
  console.log(`  Products seeded: ${productRows.length}`);
};
