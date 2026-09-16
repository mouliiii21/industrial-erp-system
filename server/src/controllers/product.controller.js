const productService = require('../services/product.service');

async function list(req, res, next) {
  try {
    const products = await productService.listProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
