const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const analystPassword = await bcrypt.hash('Analyst@123', 10);
  const viewerPassword = await bcrypt.hash('Viewer@123', 10);

  // Re-run safely by using upsert
  const admin = await prisma.user.upsert({
    where: { email: 'admin@finance.com' },
    update: {},
    create: {
      email: 'admin@finance.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@finance.com' },
    update: {},
    create: {
      email: 'analyst@finance.com',
      name: 'Analyst User',
      passwordHash: analystPassword,
      role: 'ANALYST',
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@finance.com' },
    update: {},
    create: {
      email: 'viewer@finance.com',
      name: 'Viewer User',
      passwordHash: viewerPassword,
      role: 'VIEWER',
    },
  });

  console.log('Users created successfully.');

  // Create Transactions
  const transactionsData = [
    { amount: 5000, type: 'INCOME', category: 'Salary', date: new Date('2026-03-01'), notes: 'Monthly salary', userId: admin.id },
    { amount: 1500, type: 'EXPENSE', category: 'Rent', date: new Date('2026-03-02'), notes: 'Apartment rent', userId: admin.id },
    { amount: 200, type: 'EXPENSE', category: 'Utilities', date: new Date('2026-03-05'), notes: 'Electricity bill', userId: analyst.id },
    { amount: 3000, type: 'INCOME', category: 'Freelance', date: new Date('2026-03-10'), notes: 'Side project payout', userId: analyst.id },
    { amount: 50, type: 'EXPENSE', category: 'Food', date: new Date('2026-03-12'), notes: 'Groceries', userId: viewer.id },
    { amount: 120, type: 'EXPENSE', category: 'Transport', date: new Date('2026-03-15'), notes: 'Train ticket', userId: viewer.id },
    { amount: 800, type: 'INCOME', category: 'Investment', date: new Date('2026-03-20'), notes: 'Dividend payout', userId: admin.id },
    { amount: 45, type: 'EXPENSE', category: 'Entertainment', date: new Date('2026-03-22'), notes: 'Movie tickets', userId: analyst.id },
    { amount: 300, type: 'EXPENSE', category: 'Healthcare', date: new Date('2026-03-25'), notes: 'Doctor visit', userId: viewer.id },
    { amount: 1000, type: 'INCOME', category: 'Bonus', date: new Date('2026-03-28'), notes: 'Performance bonus', userId: analyst.id },
  ];

  // Using simple createMany isn't supported inside sqlite but we are using postgresql
  // Because userId is required, we do it in a loop to ensure correct assignment
  for (const t of transactionsData) {
    await prisma.transaction.create({
      data: t
    });
  }

  console.log('Transactions created successfully.');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
