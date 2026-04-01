const dashboardService = require('./dashboard.service');
const { successResponse } = require('../../utils/response');

const getSummary = async (req, res, next) => {
  try {
    const result = await dashboardService.getSummary(req.user.userId);
    return successResponse(res, 'Dashboard summary retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
};
