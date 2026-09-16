const db = require('../db');
const AppError = require('../utils/AppError');

async function getAvailability() {
  return db('inventory as i')
    .join('products as p', 'p.id', 'i.product_id')
    .select(
      'p.id as productId',
      'p.product_code as productCode',
      'p.name as productName',
      'i.physical_qty as physicalQty',
      'i.reserved_qty as reservedQty',
      db.raw('(i.physical_qty - i.reserved_qty) as "availableQty"')
    )
    .orderBy('p.id');
}

/**
 * Reserves stock for a list of { productId, quantity } items.
 *
 * Concurrency safety: each reservation is a single conditional UPDATE —
 *   UPDATE inventory SET reserved_qty = reserved_qty + :qty
 *   WHERE product_id = :id AND physical_qty - reserved_qty >= :qty
 * Postgres serializes writes to the same row, so if two requests race to
 * reserve the last units of a product, the second UPDATE re-evaluates the
 * WHERE clause against the row the first one just committed (or is holding
 * a lock on) and simply matches 0 rows — it never overshoots. This needs
 * no explicit SELECT ... FOR UPDATE; the WHERE clause on the UPDATE itself
 * is the lock. All items in the same order share `trx` so a failure on
 * any one item rolls back reservations already made for earlier items in
 * the same call.
 *
 * @param {import('knex').Knex.Transaction} trx
 * @param {{productId:number, quantity:number}[]} items
 */
async function reserveItems(trx, items) {
  for (const item of items) {
    const affectedRows = await trx('inventory')
      .where('product_id', item.productId)
      .andWhere(trx.raw('physical_qty - reserved_qty >= ?', [item.quantity]))
      .increment('reserved_qty', item.quantity);

    if (!affectedRows) {
      throw new AppError(
        `Insufficient available stock for product ${item.productId} (requested ${item.quantity})`,
        409
      );
    }
  }
}

/**
 * Releases previously reserved stock (e.g. order cancellation).
 * Guards against releasing more than is currently reserved.
 */
async function releaseItems(trx, items) {
  for (const item of items) {
    const affectedRows = await trx('inventory')
      .where('product_id', item.productId)
      .andWhere('reserved_qty', '>=', item.quantity)
      .decrement('reserved_qty', item.quantity);

    if (!affectedRows) {
      throw new AppError(`Cannot release more than is reserved for product ${item.productId}`, 409);
    }
  }
}

/**
 * Dispatch: decrements both physical_qty and reserved_qty together.
 * Guarded so you can never dispatch more than is currently reserved.
 */
async function dispatchItems(trx, items) {
  for (const item of items) {
    const affectedRows = await trx('inventory')
      .where('product_id', item.productId)
      .andWhere('reserved_qty', '>=', item.quantity)
      .andWhere('physical_qty', '>=', item.quantity)
      .decrement({ reserved_qty: item.quantity, physical_qty: item.quantity });

    if (!affectedRows) {
      throw new AppError(`Cannot dispatch more than reserved for product ${item.productId}`, 409);
    }
  }
}

module.exports = { getAvailability, reserveItems, releaseItems, dispatchItems };
