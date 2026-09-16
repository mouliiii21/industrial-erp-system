const db = require('../db');
const AppError = require('../utils/AppError');
const { generateDocumentNumber } = require('../utils/documentNumber');

async function createEnquiry(userId, payload) {
  return db.transaction(async (trx) => {
    let customerId = payload.customerId;

    if (!customerId) {
      const [customer] = await trx('customers')
        .insert({
          company_name: payload.customer.companyName,
          contact_person: payload.customer.contactPerson,
          mobile: payload.customer.mobile,
          email: payload.customer.email,
          city: payload.customer.city,
        })
        .returning('id');
      customerId = customer.id;
    } else {
      const exists = await trx('customers').where({ id: customerId }).first();
      if (!exists) throw new AppError(`Customer ${customerId} not found`, 404);
    }

    const enquiryNumber = await generateDocumentNumber(trx, 'enquiries', 'enquiry_number', 'ENQ');

    const [enquiry] = await trx('enquiries')
      .insert({
        enquiry_number: enquiryNumber,
        customer_id: customerId,
        required_date: payload.requiredDate || null,
        notes: payload.notes || null,
        status: 'NEW',
        created_by_id: userId,
      })
      .returning('*');

    const itemRows = payload.items.map((item) => ({
      enquiry_id: enquiry.id,
      product_id: item.productId,
      quantity: item.quantity,
    }));
    await trx('enquiry_items').insert(itemRows);

    return getEnquiryByIdTrx(trx, enquiry.id);
  });
}

function baseEnquiryQuery(knexInstance) {
  return knexInstance('enquiries as e')
    .join('customers as c', 'c.id', 'e.customer_id')
    .leftJoin('enquiry_items as ei', 'ei.enquiry_id', 'e.id')
    .leftJoin('products as p', 'p.id', 'ei.product_id')
    .groupBy('e.id', 'c.id')
    .select(
      'e.id',
      'e.enquiry_number as enquiryNumber',
      'e.enquiry_date as enquiryDate',
      'e.required_date as requiredDate',
      'e.notes',
      'e.status',
      'c.id as customerId',
      'c.company_name as companyName',
      'c.contact_person as contactPerson',
      'c.mobile',
      'c.email',
      'c.city',
      db.raw(`
        COALESCE(
          json_agg(
            json_build_object('productId', ei.product_id, 'productName', p.name, 'quantity', ei.quantity)
          ) FILTER (WHERE ei.id IS NOT NULL),
          '[]'
        ) as items
      `)
    );
}

async function listEnquiries() {
  return baseEnquiryQuery(db).orderBy('e.id', 'desc');
}

async function getEnquiryByIdTrx(trx, id) {
  const row = await baseEnquiryQuery(trx).where('e.id', id).first();
  if (!row) throw new AppError(`Enquiry ${id} not found`, 404);
  return row;
}

async function getEnquiryById(id) {
  return getEnquiryByIdTrx(db, id);
}

module.exports = { createEnquiry, listEnquiries, getEnquiryById };
