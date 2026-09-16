const { z } = require('zod');

const itemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const customerInputSchema = z.object({
  companyName: z.string().min(1),
  contactPerson: z.string().min(1),
  mobile: z.string().min(1),
  email: z.string().email().optional(),
  city: z.string().optional(),
});

const createEnquirySchema = z
  .object({
    customerId: z.number().int().positive().optional(),
    customer: customerInputSchema.optional(),
    requiredDate: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(itemSchema).min(1, 'At least one product line is required'),
  })
  .refine((data) => data.customerId || data.customer, {
    message: 'Provide either an existing customerId or new customer details',
    path: ['customerId'],
  });

module.exports = { createEnquirySchema };
