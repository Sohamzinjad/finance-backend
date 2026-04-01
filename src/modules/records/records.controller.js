const recordsService = require('./records.service');
const { successResponse } = require('../../utils/response');

const getAllRecords = async (req, res, next) => {
  try {
    const result = await recordsService.getRecordsByUser(req.user.userId);
    return successResponse(res, 'Records retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

const createRecord = async (req, res, next) => {
  try {
    const result = await recordsService.createRecord(req.user.userId, req.body);
    return successResponse(res, 'Record created successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRecords,
  createRecord,
};
