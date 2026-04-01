const express = require('express');
const dashboardController = require('./dashboard.controller');
const authenticate = require('../../middlewares/authenticate');

const router = express.Router();

router.use(authenticate);

router.get('/summary', dashboardController.getSummary);

module.exports = router;
