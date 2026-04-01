const usersService = require('./users.service');
const { successResponse } = require('../../utils/response');

const getProfile = async (req, res, next) => {
  try {
    const result = await usersService.getUserById(req.user.userId);
    return successResponse(res, 'User profile retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
};
