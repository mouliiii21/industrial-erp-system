const inventoryService = require('../services/inventory.service');

async function list(req, res, next) {
  try {
    const availability = await inventoryService.getAvailability();
    res.json(availability);
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
