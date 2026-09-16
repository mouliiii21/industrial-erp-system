/**
 * Computes a single quotation line's amount.
 * baseAmount = quantity * unitPrice
 * afterDiscount = baseAmount * (1 - discountPct/100)
 * lineAmount = afterDiscount * (1 + gstPct/100)
 * Rounded to 2 decimal places (currency).
 */
function calculateLineAmount({ quantity, unitPrice, discountPct = 0, gstPct = 0 }) {
  const baseAmount = quantity * unitPrice;
  const afterDiscount = baseAmount * (1 - discountPct / 100);
  const lineAmount = afterDiscount * (1 + gstPct / 100);
  return round2(lineAmount);
}

/** Computes each line's amount plus the quotation's grand total. */
function calculateQuotationTotals(items) {
  const lines = items.map((item) => ({
    ...item,
    lineAmount: calculateLineAmount(item),
  }));
  const grandTotal = round2(lines.reduce((sum, line) => sum + line.lineAmount, 0));
  return { lines, grandTotal };
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

module.exports = { calculateLineAmount, calculateQuotationTotals, round2 };
