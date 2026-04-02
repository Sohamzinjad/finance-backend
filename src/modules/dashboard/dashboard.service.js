const prisma = require('../../config/db');

const getSummary = async (userId) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
  });

  // prisma.transaction.amount is a Decimal, so we parseInt/parseFloat it
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    totalTransactions: transactions.length,
  };
};

module.exports = {
  getSummary,
};
