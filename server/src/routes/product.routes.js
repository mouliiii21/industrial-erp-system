const router = require('express').Router();
const authenticate = require('../middleware/auth');
const productController = require('../controllers/product.controller');

router.get('/', authenticate, productController.list);

module.exports = router;
