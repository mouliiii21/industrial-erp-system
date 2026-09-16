const { calculateLineAmount, calculateQuotationTotals } = require('../utils/pricing');

describe('pricing calculations', () => {
  test('Test 1: a single line applies discount then GST correctly', () => {
    // 10 units @ 45, 5% discount, 18% GST
    // base = 450, afterDiscount = 427.5, +18% GST = 504.45
    const amount = calculateLineAmount({ quantity: 10, unitPrice: 45, discountPct: 5, gstPct: 18 });
    expect(amount).toBeCloseTo(504.45, 2);
  });

  test('Test 1: a line with no discount and no GST equals the base amount', () => {
    const amount = calculateLineAmount({ quantity: 3, unitPrice: 100 });
    expect(amount).toBeCloseTo(300, 2);
  });

  test('Test 1: quotation grand total is the sum of all line amounts', () => {
    const { lines, grandTotal } = calculateQuotationTotals([
      { quantity: 10, unitPrice: 45, discountPct: 5, gstPct: 18 },
      { quantity: 5, unitPrice: 220.5, discountPct: 0, gstPct: 18 },
    ]);
    expect(lines[0].lineAmount).toBeCloseTo(504.45, 2);
    expect(lines[1].lineAmount).toBeCloseTo(1300.95, 2);
    expect(grandTotal).toBeCloseTo(1805.4, 2);
  });
});
