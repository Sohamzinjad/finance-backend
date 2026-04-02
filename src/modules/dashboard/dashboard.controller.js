const dashboardService = require('./dashboard.service');
const { successResponse } = require('../../utils/response');

const getSummary = async (req, res, next) => {
  try {
    const result = await dashboardService.getSummary();
    return successResponse(res, result, 'Dashboard summary retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getCategoryBreakdown = async (req, res, next) => {
  try {
    const result = await dashboardService.getCategoryBreakdown(req.query.type);
    return successResponse(res, result, 'Category breakdown retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getMonthlyTrends = async (req, res, next) => {
  try {
    const result = await dashboardService.getMonthlyTrends(req.query.year);
    return successResponse(res, result, 'Monthly trends retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const result = await dashboardService.getRecentActivity(req.query.limit);
    return successResponse(res, result, 'Recent activity retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
};
