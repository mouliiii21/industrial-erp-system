const router = require('express').Router();
const validate = require('../middleware/validate');
const { loginSchema } = require('../validation/auth.schema');
const authController = require('../controllers/auth.controller');

router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
