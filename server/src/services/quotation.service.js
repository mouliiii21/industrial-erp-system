const db = require('../db');
const AppError = require('../utils/AppError');
const { generateDocumentNumber } = require('../utils/documentNumber');
const { calculateQuotationTotals } = require('../utils/pricing');

const ALLOWED_TRANSITIONS = {
  DRAFT: ['SENT'],
  SENT: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: [],
  REJECTED: [],
};

async function createQuotation(userId, payload) {
  return db.transaction(async (trx) => {
    const enquiry = await trx('enquiries').where({ id: payload.enquiryId }).first();
    if (!enquiry) throw new AppError(`Enquiry ${payload.enquiryId} not found`, 404);

    const { lines, grandTotal } = calculateQuotationTotals(payload.items);

    const quotationNumber = await generateDocumentNumber(trx, 'quotations', 'quotation_number', 'QUO');

    const [quotation] = await trx('quotations')
      .insert({
        quotation_number: quotationNumber,
        enquiry_id: enquiry.id,
        customer_id: enquiry.customer_id,
        valid_until: payload.validUntil || null,
        status: 'DRAFT',
        grand_total: grandTotal,
        created_by_id: userId,
      })
      .returning('*');

    const itemRows = lines.map((line) => ({
      quotation_id: quotation.id,
      product_id: line.productId,
      quantity: line.quantity,
      unit_price: line.unitPrice,
      discount_pct: line.discountPct,
      gst_pct: line.gstPct,
      line_amount: line.lineAmount,
    }));
    await trx('quotation_items').insert(itemRows);

    await trx('enquiries').where({ id: enquiry.id }).update({ status: 'QUOTED' });

    return getQuotationByIdTrx(trx, quotation.id);
  });
}

async function updateStatus(id, nextStatus) {
  return db.transaction(async (trx) => {
    const quotation = await trx('quotations').where({ id }).first();
    if (!quotation) throw new AppError(`Quotation ${id} not found`, 404);

    const allowed = ALLOWED_TRANSITIONS[quotation.status] || [];
    if (!allowed.includes(nextStatus)) {
      throw new AppError(
        `Cannot move quotation from ${quotation.status} to ${nextStatus}`,
        409
      );
    }

    await trx('quotations').where({ id }).update({ status: nextStatus });

    if (nextStatus === 'ACCEPTED') {
      await trx('enquiries').where({ id: quotation.enquiry_id }).update({ status: 'WON' });
    } else if (nextStatus === 'REJECTED') {
      await trx('enquiries').where({ id: quotation.enquiry_id }).update({ status: 'LOST' });
    }

    return getQuotationByIdTrx(trx, id);
  });
}

async function convertToSalesOrder(id) {
  return db.transaction(async (trx) => {
    const quotation = await trx('quotations').where({ id }).first();
    if (!quotation) throw new AppError(`Quotation ${id} not found`, 404);

    if (quotation.status !== 'ACCEPTED') {
      throw new AppError(
        `Only an ACCEPTED quotation can be converted to a sales order (current status: ${quotation.status})`,
        409
      );
    }

    const existingOrder = await trx('sales_orders').where({ quotation_id: id }).first();
    if (existingOrder) {
      throw new AppError('A sales order already exists for this quotation', 409);
    }

    const items = await trx('quotation_items').where({ quotation_id: id });

    const orderNumber = await generateDocumentNumber(trx, 'sales_orders', 'order_number', 'SO');

    const [order] = await trx('sales_orders')
      .insert({
        order_number: orderNumber,
        customer_id: quotation.customer_id,
        quotation_id: quotation.id,
        status: 'PENDING',
        total_amount: quotation.grand_total,
      })
      .returning('*');

    const orderItemRows = items.map((item) => ({
      sales_order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
    }));
    await trx('sales_order_items').insert(orderItemRows);

    return order;
  });
}

function baseQuotationQuery(knexInstance) {
  return knexInstance('quotations as q')
    .join('customers as c', 'c.id', 'q.customer_id')
    .leftJoin('quotation_items as qi', 'qi.quotation_id', 'q.id')
    .leftJoin('products as p', 'p.id', 'qi.product_id')
    .groupBy('q.id', 'c.id')
    .select(
      'q.id',
      'q.quotation_number as quotationNumber',
      'q.enquiry_id as enquiryId',
      'q.customer_id as customerId',
      'c.company_name as companyName',
      'q.valid_until as validUntil',
      'q.status',
      'q.grand_total as grandTotal',
      'q.created_at as createdAt',
      db.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'productId', qi.product_id,
              'productName', p.name,
              'quantity', qi.quantity,
              'unitPrice', qi.unit_price,
              'discountPct', qi.discount_pct,
              'gstPct', qi.gst_pct,
              'lineAmount', qi.line_amount
            )
          ) FILTER (WHERE qi.id IS NOT NULL),
          '[]'
        ) as items
      `)
    );
}

async function listQuotations() {
  return baseQuotationQuery(db).orderBy('q.id', 'desc');
}

async function getQuotationByIdTrx(trx, id) {
  const row = await baseQuotationQuery(trx).where('q.id', id).first();
  if (!row) throw new AppError(`Quotation ${id} not found`, 404);
  return row;
}

async function getQuotationById(id) {
  return getQuotationByIdTrx(db, id);
}

module.exports = {
  createQuotation,
  updateStatus,
  convertToSalesOrder,
  listQuotations,
  getQuotationById,
};
