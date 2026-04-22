import { env } from './env.js';

const BASE = env.MODEL_URL;

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Model API ${path} → ${res.status}: ${text}`);
  }

  return res.json();
}

export const modelClient = {
  sentiment: (text, lang = 'es') =>
    post('/analysis/sentiment', { text, lang }),

  financialHealth: (monthly_income, fixed_expenses, opts = {}) =>
    post('/analysis/financial-health', { monthly_income, fixed_expenses, ...opts }),

  spendingPattern: (transactions, monthly_income, lang = 'es') =>
    post('/analysis/spending-pattern', { transactions, monthly_income, lang }),

  predictExpenses: (transactions, months_to_predict = 1, lang = 'es') =>
    post('/analysis/predict-expenses', { transactions, months_to_predict, lang }),

  purchaseImpact: (product_name, price, monthly_income, opts = {}) =>
    post('/analysis/purchase-impact', { product_name, price, monthly_income, ...opts }),

  profile: (transactions, monthly_income, goals_completion_rate = 0, lang = 'es') =>
    post('/analysis/profile', { transactions, monthly_income, goals_completion_rate, lang }),

  concerns: (text, lang = 'es') =>
    post('/analysis/concerns', { text, lang }),
};
