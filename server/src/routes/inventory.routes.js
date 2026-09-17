const router = require('express').Router();

const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');

const inventoryController = require('../controllers/inventory.controller');

router.get('/', authenticate, inventoryController.list);

router.patch(
  '/:productId',
  authenticate,
  requireRole('ADMIN'),
  inventoryController.update
);

module.exports = router;
