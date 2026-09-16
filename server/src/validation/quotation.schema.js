const { z } = require('zod');

// Note: the client sends quantity/unitPrice/discountPct/gstPct only.
// lineAmount and grandTotal are never accepted from the client —
// they are always computed server-side in quotation.service.js.
const quotationItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  discountPct: z.number().min(0).max(100).default(0),
  gstPct: z.number().min(0).default(0),
});

const createQuotationSchema = z.object({
  enquiryId: z.number().int().positive(),
  validUntil: z.string().optional(),
  items: z.array(quotationItemSchema).min(1, 'At least one product line is required'),
});

const updateStatusSchema = z.object({
  status: z.enum(['SENT', 'ACCEPTED', 'REJECTED']),
});

module.exports = { createQuotationSchema, updateStatusSchema };
