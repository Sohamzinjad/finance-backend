const authService = require('./auth.service');
const { successResponse } = require('../../utils/response');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return successResponse(res, user, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return successResponse(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.userId);
    return successResponse(res, user, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile };
