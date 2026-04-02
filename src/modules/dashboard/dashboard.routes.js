const express = require('express');
const dashboardController = require('./dashboard.controller');
const authenticate = require('../../middlewares/authenticate');
const requireRole = require('../../middlewares/requireRole');

const router = express.Router();

router.use(authenticate);

router.get('/summary', requireRole('VIEWER', 'ANALYST', 'ADMIN'), dashboardController.getSummary);
router.get('/by-category', requireRole('VIEWER', 'ANALYST', 'ADMIN'), dashboardController.getCategoryBreakdown);
router.get('/trends', requireRole('ANALYST', 'ADMIN'), dashboardController.getMonthlyTrends);
router.get('/recent', requireRole('VIEWER', 'ANALYST', 'ADMIN'), dashboardController.getRecentActivity);

module.exports = router;
