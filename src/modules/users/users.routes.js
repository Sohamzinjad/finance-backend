const express = require('express');
const usersController = require('./users.controller');
const authenticate = require('../../middlewares/authenticate');
const requireRole = require('../../middlewares/requireRole');
const validate = require('../../middlewares/validate');
const { updateUserSchema } = require('./users.schema');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/users — ADMIN only
router.get('/', requireRole('ADMIN'), usersController.getAllUsers);

// GET /api/users/:id — ADMIN only
router.get('/:id', requireRole('ADMIN'), usersController.getUserById);

// PATCH /api/users/:id — ADMIN only
router.patch('/:id', requireRole('ADMIN'), validate(updateUserSchema), usersController.updateUser);

// PATCH /api/users/:id/deactivate — ADMIN only
router.patch('/:id/deactivate', requireRole('ADMIN'), usersController.deactivateUser);

// DELETE /api/users/:id — ADMIN only
router.delete('/:id', requireRole('ADMIN'), usersController.deleteUser);

module.exports = router;
