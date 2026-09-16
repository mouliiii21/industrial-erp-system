const router = require('express').Router();
const authenticate = require('../middleware/auth');
const inventoryController = require('../controllers/inventory.controller');

router.get('/', authenticate, inventoryController.list);

module.exports = router;
