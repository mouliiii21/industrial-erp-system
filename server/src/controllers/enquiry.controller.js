const enquiryService = require('../services/enquiry.service');

async function create(req, res, next) {
  try {
    const enquiry = await enquiryService.createEnquiry(req.user.id, req.body);
    res.status(201).json(enquiry);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const enquiries = await enquiryService.listEnquiries();
    res.json(enquiries);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const enquiry = await enquiryService.getEnquiryById(Number(req.params.id));
    res.json(enquiry);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne };
