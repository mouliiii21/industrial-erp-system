const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const validate = require('../middleware/validate');
const { createDispatchSchema } = require('../validation/salesOrder.schema');
const salesOrderController = require('../controllers/salesOrder.controller');

router.use(authenticate);

router.get('/', salesOrderController.list);
router.get('/:id', salesOrderController.getOne);
router.post('/:id/confirm', requireRole('ADMIN'), salesOrderController.confirm);
router.post(
  '/:id/dispatch',
  requireRole('ADMIN'),
  validate(createDispatchSchema),
  salesOrderController.dispatch
);
router.post('/:id/cancel', requireRole('ADMIN'), salesOrderController.cancel);

module.exports = router;
