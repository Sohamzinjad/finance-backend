const prisma = require('../../config/db');

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
