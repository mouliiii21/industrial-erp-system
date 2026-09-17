const inventoryService = require('../services/inventory.service');

async function list(req, res, next) {
  try {
    const availability = await inventoryService.getAvailability();

    res.json(availability);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const productId = Number(req.params.productId);
    const { physicalQty } = req.body;

    const updated = await inventoryService.updatePhysicalQuantity(
      productId,
      physicalQty
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, update };