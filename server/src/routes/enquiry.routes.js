const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const validate = require('../middleware/validate');
const { createEnquirySchema } = require('../validation/enquiry.schema');
const enquiryController = require('../controllers/enquiry.controller');

router.use(authenticate);

router.get('/', enquiryController.list);
router.get('/:id', enquiryController.getOne);
router.post('/', requireRole('SALES'), validate(createEnquirySchema), enquiryController.create);

module.exports = router;
