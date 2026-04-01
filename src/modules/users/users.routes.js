const express = require('express');
const usersController = require('./users.controller');
const authenticate = require('../../middlewares/authenticate');

const router = express.Router();

router.use(authenticate);

router.get('/me', usersController.getProfile);

module.exports = router;
