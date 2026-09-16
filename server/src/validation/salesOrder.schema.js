const { z } = require('zod');

const dispatchItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

// items is optional — if omitted, the full order quantity for every
// line is dispatched (matches the spec's worked example: reserved=60 -> dispatch=60).
const createDispatchSchema = z.object({
  vehicleNumber: z.string().min(1),
  driverName: z.string().min(1),
  items: z.array(dispatchItemSchema).optional(),
});

module.exports = { createDispatchSchema };
