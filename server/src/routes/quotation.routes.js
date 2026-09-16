const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const validate = require('../middleware/validate');
const { createQuotationSchema, updateStatusSchema } = require('../validation/quotation.schema');
const quotationController = require('../controllers/quotation.controller');

router.use(authenticate);

router.get('/', quotationController.list);
router.get('/:id', quotationController.getOne);
router.post('/', requireRole('SALES'), validate(createQuotationSchema), quotationController.create);
router.patch(
  '/:id/status',
  requireRole('SALES'),
  validate(updateStatusSchema),
  quotationController.updateStatus
);
router.post('/:id/convert', requireRole('SALES'), quotationController.convert);

module.exports = router;
