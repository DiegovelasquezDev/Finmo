import { prisma } from '../../../configs/prisma.js';

export async function getSummary(userId, { startDate, endDate } = {}) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
  const end   = endDate   ? new Date(endDate)   : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [incomeAgg, expenseAgg, recentTransactions, topCategories, goalsProgress] =
    await prisma.$transaction([
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME', date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: start, lte: end } },
        include: { category: { select: { id: true, name: true, icon: true, color: true } } },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5,
      }),
      prisma.goal.findMany({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);

  const totalIncome = Number(incomeAgg._sum.amount ?? 0);
  const totalExpense = Number(expenseAgg._sum.amount ?? 0);
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

  const categoryIds = topCategories.map((c) => c.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, icon: true, color: true },
  });
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const topExpenseCategories = topCategories.map((t) => ({
    category: categoryMap[t.categoryId],
    total: Number(t._sum.amount ?? 0),
  }));

  return {
    period: { start, end },
    totals: { income: totalIncome, expense: totalExpense, balance, savingsRate: Number(savingsRate) },
    recentTransactions,
    topExpenseCategories,
    goalsProgress: goalsProgress.map((g) => ({
      ...g,
      targetAmount: Number(g.targetAmount),
      currentAmount: Number(g.currentAmount),
      progress: g.targetAmount > 0 ? ((Number(g.currentAmount) / Number(g.targetAmount)) * 100).toFixed(1) : 0,
    })),
  };
}

export async function getMonthlyTrend(userId, { months = 6, startDate, endDate } = {}) {
  const results = [];
  const now = new Date();

  let loopStart, loopEnd;
  if (startDate && endDate) {
    loopStart = new Date(startDate);
    loopEnd   = new Date(endDate);
  } else {
    loopStart = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    loopEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  const cursor = new Date(loopStart.getFullYear(), loopStart.getMonth(), 1);
  const finalMonth = new Date(loopEnd.getFullYear(), loopEnd.getMonth(), 1);

  while (cursor <= finalMonth) {
    const start = new Date(cursor);
    const end   = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59);

    const [income, expense] = await prisma.$transaction([
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME', date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ]);

    results.push({
      month: start.toISOString().slice(0, 7),
      income: Number(income._sum.amount ?? 0),
      expense: Number(expense._sum.amount ?? 0),
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return results;
}
