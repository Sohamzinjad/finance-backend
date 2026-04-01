const prisma = require('../../config/db');

const getRecordsByUser = async (userId) => {
  return await prisma.record.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
};

const createRecord = async (userId, data) => {
  return await prisma.record.create({
    data: {
      ...data,
      userId,
    },
  });
};

module.exports = {
  getRecordsByUser,
  createRecord,
};
