const recordsService = require('./records.service');
const { successResponse } = require('../../utils/response');

const createRecord = async (req, res, next) => {
  try {
    const record = await recordsService.createRecord(req.user.userId, req.body);
    return successResponse(res, record, 'Record created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getAllRecords = async (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      userId: req.query.userId,
    };

    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await recordsService.getAllRecords(filters, pagination);
    return successResponse(res, result, 'Records retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const record = await recordsService.getRecordById(req.params.id);
    return successResponse(res, record, 'Record retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const record = await recordsService.updateRecord(
      req.params.id,
      req.body,
      req.user.role,
      req.user.userId
    );

    return successResponse(res, record, 'Record updated successfully');
  } catch (error) {
    next(error);
  }
};

const softDeleteRecord = async (req, res, next) => {
  try {
    const record = await recordsService.softDeleteRecord(
      req.params.id,
      req.user.role,
      req.user.userId
    );

    return successResponse(res, record, 'Record deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  softDeleteRecord,
};
