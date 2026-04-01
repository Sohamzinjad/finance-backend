const authService = require('./auth.service');
const { successResponse } = require('../../utils/response');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return successResponse(res, 'User logged in successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
