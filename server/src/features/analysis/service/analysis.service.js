import { prisma } from '../../../configs/prisma.js';
import { modelClient } from '../../../configs/model.js';
import { createAlert } from '../../alerts/service/alerts.service.js';

function toModelTransactions(transactions) {
  return transactions.map((t) => ({
    amount: Number(t.amount),
    type: t.type,
    category: t.category?.name ?? 'Sin categoría',
    date: t.date.toISOString().slice(0, 10),
  }));
}

export async function analyzeSentiment(text, lang = 'es') {
  return modelClient.sentiment(text, lang);
}

export async function analyzeFinancialHealth(userId, body, lang = 'es') {
  const result = await modelClient.financialHealth(
    body.monthly_income,
    body.fixed_expenses,
    {
      total_debt: body.total_debt,
      financial_stress_level: body.financial_stress_level,
      lang,
    },
  );

  // Persist alert if burden is elevated or critical
  if (['CARGA_ELEVADA', 'CRITICO'].includes(result.level)) {
    await createAlert(userId, {
      type: result.level === 'CRITICO' ? 'BUDGET_EXCEEDED' : 'BUDGET_WARNING',
      title: lang === 'en' ? 'Financial health alert' : 'Alerta de salud financiera',
      message: result.recommendation,
      threshold: result.health_ratio,
      triggeredAt: new Date(),
    });
  }

  return result;
}

export async function analyzeSpendingPattern(userId, { startDate, endDate } = {}, lang = 'es') {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { monthlyIncome: true },
  });

  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: start, lte: end } },
    include: { category: { select: { name: true } } },
    orderBy: { date: 'desc' },
  });

  const monthly_income = Number(user?.monthlyIncome ?? 0);
  const result = await modelClient.spendingPattern(
    toModelTransactions(transactions),
    monthly_income,
    lang,
  );

  // Persist alert for detected negative patterns
  if (result.negative_patterns.length > 0) {
    await createAlert(userId, {
      type: 'NEGATIVE_PATTERN',
      title: lang === 'en' ? 'Negative patterns detected' : 'Patrones negativos detectados',
      message: result.negative_patterns.join(' '),
      triggeredAt: new Date(),
    });
  }

  return result;
}

export async function predictExpenses(userId, { months_to_predict = 1, startDate, endDate } = {}, lang = 'es') {
  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: start, lte: end } },
    include: { category: { select: { name: true } } },
    orderBy: { date: 'asc' },
  });

  return modelClient.predictExpenses(toModelTransactions(transactions), months_to_predict, lang);
}

export async function analyzeProfile(userId, lang = 'es') {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [user, transactions, goals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyIncome: true },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { category: { select: { name: true } } },
      orderBy: { date: 'asc' },
    }),
    prisma.goal.findMany({
      where: { userId },
      select: { targetAmount: true, currentAmount: true, status: true },
    }),
  ]);

  const monthly_income = Number(user?.monthlyIncome ?? 0);

  // Average goal completion rate (0–1)
  const activeGoals = goals.filter(g => g.status !== 'CANCELLED');
  const goals_completion_rate = activeGoals.length > 0
    ? activeGoals.reduce((sum, g) => {
        const target  = Number(g.targetAmount);
        const current = Number(g.currentAmount);
        return sum + (target > 0 ? Math.min(1, current / target) : 0);
      }, 0) / activeGoals.length
    : 0;

  const result = await modelClient.profile(
    toModelTransactions(transactions),
    monthly_income || 1,
    goals_completion_rate,
    lang,
  );

  // Persist alert if score is critical
  if (result.score < 30) {
    await createAlert(userId, {
      type: 'NEGATIVE_PATTERN',
      title: lang === 'en' ? 'Your financial score is critical' : 'Tu score financiero es crítico',
      message: lang === 'en'
        ? `Your financial score is ${result.score}/100. ${result.archetype_tip}`
        : `Tu puntuación financiera es ${result.score}/100. ${result.archetype_tip}`,
      triggeredAt: new Date(),
    });
  }

  // Save score snapshot (at most one per day)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const existing = await prisma.scoreSnapshot.findFirst({
    where: { userId, createdAt: { gte: todayStart } },
  });
  if (!existing) {
    await prisma.scoreSnapshot.create({
      data: { userId, score: result.score, archetypeKey: result.archetype_key },
    });
  } else {
    await prisma.scoreSnapshot.update({
      where: { id: existing.id },
      data: { score: result.score, archetypeKey: result.archetype_key },
    });
  }

  // Detect generic-categorized transactions
  const GENERIC_CATEGORIES = ['Otros gastos', 'Otros ingresos', 'Sin categoría'];
  const genericTxs = transactions.filter(t => GENERIC_CATEGORIES.includes(t.category?.name));

  return {
    ...result,
    goals_summary: {
      total: activeGoals.length,
      completed: activeGoals.filter(g => g.status === 'COMPLETED').length,
      completion_rate: Math.round(goals_completion_rate * 100),
      score_points: result.score_breakdown?.goal_progress ?? 0,
      score_max: 10,
    },
    uncategorized: {
      count: genericTxs.length,
      total_amount: genericTxs.reduce((s, t) => s + Number(t.amount), 0),
    },
  };
}

export async function analyzePurchaseImpact(userId, body, lang = 'es') {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { monthlyIncome: true },
  });

  const monthly_income = body.monthly_income ?? Number(user?.monthlyIncome ?? 0);

  return modelClient.purchaseImpact(
    body.product_name,
    body.price,
    monthly_income,
    {
      payment_method: body.payment_method,
      installment_months: body.installment_months,
      annual_interest_rate: body.annual_interest_rate,
      current_expense_ratio: body.current_expense_ratio,
      lang,
    },
  );
}

export async function analyzeConcern(text, lang = 'es') {
  return modelClient.concerns(text, lang);
}

export async function getScoreHistory(userId, limit = 30) {
  const snapshots = await prisma.scoreSnapshot.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: { score: true, archetypeKey: true, createdAt: true },
  });
  return snapshots;
}
