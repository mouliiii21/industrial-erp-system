/**
 * Generates a sequential document number like "ENQ-2026-0007".
 * Runs a COUNT inside the caller's transaction so the number reflects
 * the state at time of insert; a duplicate on the unique column would
 * simply fail the transaction rather than corrupt data (acceptable for
 * this case study's scale — a dedicated sequence table would be the
 * next step for high write concurrency on the same prefix).
 *
 * @param {import('knex').Knex} trx - active transaction or db instance
 * @param {string} tableName
 * @param {string} columnName
 * @param {string} prefix
 */
async function generateDocumentNumber(trx, tableName, columnName, prefix) {
  const year = new Date().getFullYear();
  const [{ count }] = await trx(tableName)
    .where(columnName, 'like', `${prefix}-${year}-%`)
    .count({ count: '*' });

  const next = Number(count) + 1;
  return `${prefix}-${year}-${String(next).padStart(4, '0')}`;
}

module.exports = { generateDocumentNumber };
