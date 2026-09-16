process.env.NODE_ENV = 'test';
require('dotenv').config();

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let salesToken;
let adminToken;

beforeAll(async () => {
  // Reseed so every run starts from the same known baseline regardless
  // of what earlier manual/API testing left behind.
  await db.seed.run();

  const salesLogin = await request(app)
    .post('/auth/login')
    .send({ email: 'sales@erp.test', password: 'Sales@123' });
  salesToken = salesLogin.body.token;

  const adminLogin = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@erp.test', password: 'Admin@123' });
  adminToken = adminLogin.body.token;
});

afterAll(async () => {
  await db.destroy();
});

async function createEnquiry(items) {
  const res = await request(app)
    .post('/enquiries')
    .set('Authorization', `Bearer ${salesToken}`)
    .send({ customerId: 1, items });
  return res.body;
}

async function createQuotation(enquiryId, items) {
  const res = await request(app)
    .post('/quotations')
    .set('Authorization', `Bearer ${salesToken}`)
    .send({ enquiryId, items });
  return res.body;
}

describe('Test 5: RBAC — unauthorized user cannot perform a restricted operation', () => {
  test('SALES user cannot confirm a sales order (ADMIN-only)', async () => {
    const res = await request(app)
      .post('/sales-orders/1/confirm')
      .set('Authorization', `Bearer ${salesToken}`);
    expect(res.status).toBe(403);
  });

  test('ADMIN cannot create an enquiry (SALES-only)', async () => {
    const res = await request(app)
      .post('/enquiries')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ customerId: 1, items: [{ productId: 1, quantity: 1 }] });
    expect(res.status).toBe(403);
  });

  test('request with no token at all is rejected', async () => {
    const res = await request(app).get('/enquiries');
    expect(res.status).toBe(401);
  });
});

describe('Test 2: DRAFT/REJECTED quotation cannot create a Sales Order', () => {
  test('DRAFT quotation cannot convert', async () => {
    const enquiry = await createEnquiry([{ productId: 1, quantity: 2 }]);
    const quotation = await createQuotation(enquiry.id, [
      { productId: 1, quantity: 2, unitPrice: 45, discountPct: 0, gstPct: 18 },
    ]);
    expect(quotation.status).toBe('DRAFT');

    const res = await request(app)
      .post(`/quotations/${quotation.id}/convert`)
      .set('Authorization', `Bearer ${salesToken}`);
    expect(res.status).toBe(409);
  });

  test('REJECTED quotation cannot convert', async () => {
    const enquiry = await createEnquiry([{ productId: 1, quantity: 2 }]);
    const quotation = await createQuotation(enquiry.id, [
      { productId: 1, quantity: 2, unitPrice: 45, discountPct: 0, gstPct: 18 },
    ]);

    await request(app)
      .patch(`/quotations/${quotation.id}/status`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ status: 'SENT' });
    await request(app)
      .patch(`/quotations/${quotation.id}/status`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ status: 'REJECTED' });

    const res = await request(app)
      .post(`/quotations/${quotation.id}/convert`)
      .set('Authorization', `Bearer ${salesToken}`);
    expect(res.status).toBe(409);
  });
});

describe('Test 3: same quotation cannot generate duplicate Sales Orders', () => {
  test('second convert attempt on an already-converted quotation fails', async () => {
    const enquiry = await createEnquiry([{ productId: 1, quantity: 2 }]);
    const quotation = await createQuotation(enquiry.id, [
      { productId: 1, quantity: 2, unitPrice: 45, discountPct: 0, gstPct: 18 },
    ]);
    await request(app)
      .patch(`/quotations/${quotation.id}/status`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ status: 'SENT' });
    await request(app)
      .patch(`/quotations/${quotation.id}/status`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ status: 'ACCEPTED' });

    const first = await request(app)
      .post(`/quotations/${quotation.id}/convert`)
      .set('Authorization', `Bearer ${salesToken}`);
    expect(first.status).toBe(201);

    const second = await request(app)
      .post(`/quotations/${quotation.id}/convert`)
      .set('Authorization', `Bearer ${salesToken}`);
    expect(second.status).toBe(409);

    // Also confirm at the data layer: only one sales order exists for this quotation.
    const count = await db('sales_orders').where({ quotation_id: quotation.id }).count();
    expect(Number(count[0].count)).toBe(1);
  });
});

describe('Test 4: cannot reserve more than available inventory', () => {
  test('confirming an order for more than available stock fails and reserves nothing', async () => {
    // Product 4 (IND-D-004) seeds with physical=200, reserved=0 -> available=200
    const enquiry = await createEnquiry([{ productId: 4, quantity: 500 }]);
    const quotation = await createQuotation(enquiry.id, [
      { productId: 4, quantity: 500, unitPrice: 890.75, discountPct: 0, gstPct: 18 },
    ]);
    await request(app)
      .patch(`/quotations/${quotation.id}/status`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ status: 'SENT' });
    await request(app)
      .patch(`/quotations/${quotation.id}/status`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ status: 'ACCEPTED' });
    const order = await request(app)
      .post(`/quotations/${quotation.id}/convert`)
      .set('Authorization', `Bearer ${salesToken}`);

    const before = await db('inventory').where({ product_id: 4 }).first();

    const confirmRes = await request(app)
      .post(`/sales-orders/${order.body.id}/confirm`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(confirmRes.status).toBe(409);

    const after = await db('inventory').where({ product_id: 4 }).first();
    expect(after.reserved_qty).toBe(before.reserved_qty); // untouched, no partial reservation
  });
});

describe('Bonus: simultaneous inventory reservations cannot oversell', () => {
  test('two concurrent orders competing for the same stock — only one wins', async () => {
    // Product 3 (IND-C-003): physical=120, reserved=20 -> available=100
    const enquiryA = await createEnquiry([{ productId: 3, quantity: 70 }]);
    const quotationA = await createQuotation(enquiryA.id, [
      { productId: 3, quantity: 70, unitPrice: 1350, discountPct: 0, gstPct: 18 },
    ]);
    const enquiryB = await createEnquiry([{ productId: 3, quantity: 70 }]);
    const quotationB = await createQuotation(enquiryB.id, [
      { productId: 3, quantity: 70, unitPrice: 1350, discountPct: 0, gstPct: 18 },
    ]);

    for (const q of [quotationA, quotationB]) {
      await request(app)
        .patch(`/quotations/${q.id}/status`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ status: 'SENT' });
      await request(app)
        .patch(`/quotations/${q.id}/status`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ status: 'ACCEPTED' });
    }

    const orderA = await request(app)
      .post(`/quotations/${quotationA.id}/convert`)
      .set('Authorization', `Bearer ${salesToken}`);
    const orderB = await request(app)
      .post(`/quotations/${quotationB.id}/convert`)
      .set('Authorization', `Bearer ${salesToken}`);

    // Fire both confirmations at the same time — combined they ask for
    // 140 units against 100 available.
    const [resA, resB] = await Promise.all([
      request(app).post(`/sales-orders/${orderA.body.id}/confirm`).set('Authorization', `Bearer ${adminToken}`),
      request(app).post(`/sales-orders/${orderB.body.id}/confirm`).set('Authorization', `Bearer ${adminToken}`),
    ]);

    const statuses = [resA.status, resB.status].sort();
    expect(statuses).toEqual([200, 409]);

    const inventory = await db('inventory').where({ product_id: 3 }).first();
    expect(inventory.reserved_qty).toBe(90); // 20 baseline + exactly one 70
    expect(inventory.physical_qty - inventory.reserved_qty).toBe(30);
  });
});
