const usersService = require('./users.service');
const { successResponse, errorResponse } = require('../../utils/response');

const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, page, limit } = req.query;
    const result = await usersService.getAllUsers({ role, status, page, limit });
    return successResponse(res, result, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    return successResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await usersService.updateUser(req.params.id, req.body);
    return successResponse(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    // Admin cannot deactivate themselves
    if (req.user.userId === req.params.id) {
      return errorResponse(res, 'You cannot deactivate your own account', 400);
    }
    const user = await usersService.deactivateUser(req.params.id);
    return successResponse(res, user, 'User deactivated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    // Admin cannot delete themselves
    if (req.user.userId === req.params.id) {
      return errorResponse(res, 'You cannot delete your own account', 400);
    }
    await usersService.deleteUser(req.params.id);
    return successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deactivateUser, deleteUser };
