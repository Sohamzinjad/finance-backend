const prisma = require('../../config/db');

// Deprecated: replaced by src/modules/records/records.service.js.
const getTransactionsByUser = async (userId) => {
  return await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
};

const createTransaction = async (userId, data) => {
  return await prisma.transaction.create({
    data: {
      ...data,
      date: data.date ? new Date(data.date) : new Date(),
      userId,
    },
  });
};

module.exports = {
  getTransactionsByUser,
  createTransaction,
};
