const transactionsService = require('./transactions.service');
const { successResponse } = require('../../utils/response');

const getAllTransactions = async (req, res, next) => {
  try {
    const result = await transactionsService.getTransactionsByUser(req.user.userId);
    return successResponse(res, result, 'Transactions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const result = await transactionsService.createTransaction(req.user.userId, req.body);
    return successResponse(res, result, 'Transaction created successfully', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTransactions,
  createTransaction,
};
