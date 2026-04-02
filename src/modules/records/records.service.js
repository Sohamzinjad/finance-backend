const prisma = require('../../config/db');

const buildNotFoundError = () => {
  const error = new Error('Record not found');
  error.statusCode = 404;
  return error;
};

const buildForbiddenError = (message) => {
  const error = new Error(message);
  error.statusCode = 403;
  return error;
};

const serializeRecord = (record) => ({
  ...record,
  amount: Number(record.amount),
});

const createRecord = async (userId, data) => {
  const record = await prisma.transaction.create({
    data: {
      ...data,
      userId,
    },
  });

  return serializeRecord(record);
};

const getAllRecords = async (filters = {}, pagination = {}) => {
  const page = Math.max(Number(pagination.page) || 1, 1);
  const limit = Math.max(Number(pagination.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.category) {
    where.category = {
      contains: filters.category,
      mode: 'insensitive',
    };
  }

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.startDate || filters.endDate) {
    where.date = {};

    if (filters.startDate) {
      where.date.gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      where.date.lte = new Date(filters.endDate);
    }
  }

  const [records, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    records: records.map(serializeRecord),
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

const getRecordById = async (id) => {
  const record = await prisma.transaction.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!record) {
    throw buildNotFoundError();
  }

  return serializeRecord(record);
};

const getAccessibleRecord = async (id) => {
  const record = await prisma.transaction.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!record) {
    throw buildNotFoundError();
  }

  return record;
};

const updateRecord = async (id, data, userRole, userId) => {
  if (userRole === 'VIEWER') {
    throw buildForbiddenError('Forbidden: viewers cannot update records');
  }

  const record = await getAccessibleRecord(id);

  if (userRole === 'ANALYST' && record.userId !== userId) {
    throw buildForbiddenError('Forbidden: analysts can only update their own records');
  }

  const updatedRecord = await prisma.transaction.update({
    where: { id },
    data,
  });

  return serializeRecord(updatedRecord);
};

const softDeleteRecord = async (id, userRole, userId) => {
  if (userRole === 'VIEWER') {
    throw buildForbiddenError('Forbidden: viewers cannot delete records');
  }

  const record = await getAccessibleRecord(id);

  if (userRole === 'ANALYST' && record.userId !== userId) {
    throw buildForbiddenError('Forbidden: analysts can only delete their own records');
  }

  const deletedRecord = await prisma.transaction.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return serializeRecord(deletedRecord);
};

module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  softDeleteRecord,
};
