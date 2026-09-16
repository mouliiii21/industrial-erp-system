const quotationService = require('../services/quotation.service');

async function create(req, res, next) {
  try {
    const quotation = await quotationService.createQuotation(req.user.id, req.body);
    res.status(201).json(quotation);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    res.json(await quotationService.listQuotations());
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    res.json(await quotationService.getQuotationById(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const quotation = await quotationService.updateStatus(Number(req.params.id), req.body.status);
    res.json(quotation);
  } catch (err) {
    next(err);
  }
}

async function convert(req, res, next) {
  try {
    const order = await quotationService.convertToSalesOrder(Number(req.params.id));
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne, updateStatus, convert };
