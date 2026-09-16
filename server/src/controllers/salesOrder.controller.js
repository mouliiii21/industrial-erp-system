const salesOrderService = require('../services/salesOrder.service');

async function list(req, res, next) {
  try {
    res.json(await salesOrderService.listSalesOrders());
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    res.json(await salesOrderService.getSalesOrderById(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

async function confirm(req, res, next) {
  try {
    res.json(await salesOrderService.confirmOrder(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

async function dispatch(req, res, next) {
  try {
    const dispatch = await salesOrderService.dispatchOrder(Number(req.params.id), req.body);
    res.status(201).json(dispatch);
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    res.json(await salesOrderService.cancelOrder(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, confirm, dispatch, cancel };
