const prisma = require('../../config/db');

const getSummary = async (userId) => {
  const records = await prisma.record.findMany({
    where: { userId },
  });

  const totalIncome = records
    .filter((r) => r.type === 'INCOME')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpense = records
    .filter((r) => r.type === 'EXPENSE')
    .reduce((sum, r) => sum + r.amount, 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    totalRecords: records.length,
  };
};

module.exports = {
  getSummary,
};
