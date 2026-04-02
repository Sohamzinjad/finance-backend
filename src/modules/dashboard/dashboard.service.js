const { Prisma } = require('@prisma/client');
const prisma = require('../../config/db');

const toNumber = (value) => Number(value || 0);

const getSummary = async () => {
  const summaryRows = await prisma.$queryRaw`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) AS "totalIncome",
      COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS "totalExpenses",
      COUNT(*)::int AS "totalTransactions"
    FROM "Transaction"
    WHERE "deletedAt" IS NULL
  `;

  const summary = summaryRows[0] || {};
  const totalIncome = toNumber(summary.totalIncome);
  const totalExpenses = toNumber(summary.totalExpenses);

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    totalTransactions: Number(summary.totalTransactions || 0),
  };
};

const getCategoryBreakdown = async (type) => {
  const typeFilter = type
    ? Prisma.sql`AND type = ${type}`
    : Prisma.empty;

  const rows = await prisma.$queryRaw`
    SELECT
      category,
      COALESCE(SUM(amount), 0) AS total,
      COUNT(*)::int AS count
    FROM "Transaction"
    WHERE "deletedAt" IS NULL
    ${typeFilter}
    GROUP BY category
    ORDER BY total DESC, category ASC
  `;

  return rows.map((row) => ({
    category: row.category,
    total: toNumber(row.total),
    count: Number(row.count),
  }));
};

const getMonthlyTrends = async (year = new Date().getFullYear()) => {
  const numericYear = Number(year);

  const rows = await prisma.$queryRaw`
    SELECT
      TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
      COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expense
    FROM "Transaction"
    WHERE "deletedAt" IS NULL
      AND EXTRACT(YEAR FROM date) = ${numericYear}
    GROUP BY DATE_TRUNC('month', date)
    ORDER BY DATE_TRUNC('month', date) ASC
  `;

  return rows.map((row) => {
    const income = toNumber(row.income);
    const expense = toNumber(row.expense);

    return {
      month: row.month,
      income,
      expense,
      net: income - expense,
    };
  });
};

const getRecentActivity = async (limit = 10) => {
  const numericLimit = Math.max(Number(limit) || 10, 1);

  const records = await prisma.transaction.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { date: 'desc' },
      { createdAt: 'desc' },
    ],
    take: numericLimit,
  });

  return records.map((record) => ({
    ...record,
    amount: Number(record.amount),
  }));
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
};
