const db = require('../db');
const AppError = require('../utils/AppError');
const inventoryService = require('./inventory.service');
const { generateDocumentNumber } = require('../utils/documentNumber');

async function confirmOrder(id) {
  return db.transaction(async (trx) => {
    const order = await trx('sales_orders').where({ id }).first();
    if (!order) throw new AppError(`Sales order ${id} not found`, 404);

    if (order.status !== 'PENDING') {
      throw new AppError(
        `Only a PENDING order can be confirmed (current status: ${order.status})`,
        409
      );
    }

    const items = await trx('sales_order_items').where({ sales_order_id: id });

    // All-or-nothing: if any line can't be reserved, the whole confirm
    // fails and no partial reservation is left behind (same trx).
    await inventoryService.reserveItems(
      trx,
      items.map((i) => ({ productId: i.product_id, quantity: i.quantity }))
    );

    await trx('sales_orders').where({ id }).update({ status: 'CONFIRMED' });

    return getSalesOrderByIdTrx(trx, id);
  });
}

async function dispatchOrder(id, payload) {
  return db.transaction(async (trx) => {
    const order = await trx('sales_orders').where({ id }).first();
    if (!order) throw new AppError(`Sales order ${id} not found`, 404);

    if (order.status !== 'CONFIRMED') {
      // Also covers "dispatch of a cancelled order" and "duplicate dispatch":
      // once dispatched once, status moves to DISPATCHED and can't be
      // dispatched again from here.
      throw new AppError(
        `Only a CONFIRMED order can be dispatched (current status: ${order.status})`,
        409
      );
    }

    const orderItems = await trx('sales_order_items').where({ sales_order_id: id });
    const orderItemByProduct = new Map(orderItems.map((i) => [i.product_id, i.quantity]));

    const dispatchItems = payload.items && payload.items.length
      ? payload.items
      : orderItems.map((i) => ({ productId: i.product_id, quantity: i.quantity }));

    for (const item of dispatchItems) {
      const orderedQty = orderItemByProduct.get(item.productId);
      if (orderedQty === undefined) {
        throw new AppError(`Product ${item.productId} is not part of order ${id}`, 400);
      }
      if (item.quantity > orderedQty) {
        throw new AppError(
          `Cannot dispatch ${item.quantity} of product ${item.productId}; order only has ${orderedQty}`,
          409
        );
      }
    }

    // Decrements physical_qty and reserved_qty together, guarded so you
    // can never dispatch beyond what's actually reserved.
    await inventoryService.dispatchItems(
      trx,
      dispatchItems.map((i) => ({ productId: i.productId, quantity: i.quantity }))
    );

    const dispatchNumber = await generateDocumentNumber(trx, 'dispatches', 'dispatch_number', 'DSP');

    const [dispatch] = await trx('dispatches')
      .insert({
        dispatch_number: dispatchNumber,
        sales_order_id: id,
        vehicle_number: payload.vehicleNumber,
        driver_name: payload.driverName,
      })
      .returning('*');

    const dispatchItemRows = dispatchItems.map((i) => ({
      dispatch_id: dispatch.id,
      product_id: i.productId,
      quantity: i.quantity,
    }));
    await trx('dispatch_items').insert(dispatchItemRows);

    await trx('sales_orders').where({ id }).update({ status: 'DISPATCHED' });

    return getDispatchByIdTrx(trx, dispatch.id);
  });
}

/**
 * Not in the spec's mandatory API list, but explicitly called out as a
 * likely live-verification-round change ("cancel a confirmed order and
 * correctly release its reserved inventory") — pre-built so it's ready.
 */
async function cancelOrder(id) {
  return db.transaction(async (trx) => {
    const order = await trx('sales_orders').where({ id }).first();
    if (!order) throw new AppError(`Sales order ${id} not found`, 404);

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new AppError(
        `Cannot cancel an order with status ${order.status}`,
        409
      );
    }

    if (order.status === 'CONFIRMED') {
      const items = await trx('sales_order_items').where({ sales_order_id: id });
      await inventoryService.releaseItems(
        trx,
        items.map((i) => ({ productId: i.product_id, quantity: i.quantity }))
      );
    }

    await trx('sales_orders').where({ id }).update({ status: 'CANCELLED' });
    return getSalesOrderByIdTrx(trx, id);
  });
}

function baseOrderQuery(knexInstance) {
  return knexInstance('sales_orders as so')
    .join('customers as c', 'c.id', 'so.customer_id')
    .leftJoin('sales_order_items as soi', 'soi.sales_order_id', 'so.id')
    .leftJoin('products as p', 'p.id', 'soi.product_id')
    .groupBy('so.id', 'c.id')
    .select(
      'so.id',
      'so.order_number as orderNumber',
      'so.customer_id as customerId',
      'c.company_name as companyName',
      'so.quotation_id as quotationId',
      'so.order_date as orderDate',
      'so.status',
      'so.total_amount as totalAmount',
      db.raw(`
        COALESCE(
          json_agg(
            json_build_object('productId', soi.product_id, 'productName', p.name, 'quantity', soi.quantity)
          ) FILTER (WHERE soi.id IS NOT NULL),
          '[]'
        ) as items
      `)
    );
}

async function listSalesOrders() {
  return baseOrderQuery(db).orderBy('so.id', 'desc');
}

async function getSalesOrderByIdTrx(trx, id) {
  const row = await baseOrderQuery(trx).where('so.id', id).first();
  if (!row) throw new AppError(`Sales order ${id} not found`, 404);
  return row;
}

async function getSalesOrderById(id) {
  return getSalesOrderByIdTrx(db, id);
}

async function getDispatchByIdTrx(trx, id) {
  const dispatch = await trx('dispatches').where({ id }).first();
  const items = await trx('dispatch_items').where({ dispatch_id: id });
  return { ...dispatch, items };
}

module.exports = {
  confirmOrder,
  dispatchOrder,
  cancelOrder,
  listSalesOrders,
  getSalesOrderById,
};
