const express = require('express');
const authController = require('./auth.controller');
const authenticate = require('../../middlewares/authenticate');
const validate = require('../../middlewares/validate');
const { registerSchema, loginSchema } = require('./auth.schema');

const router = express.Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// GET /api/auth/profile  (protected)
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
