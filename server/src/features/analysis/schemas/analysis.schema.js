import { z } from 'zod';

export const sentimentSchema = z.object({
  body: z.object({
    text: z.string().min(3).max(2000),
  }),
});

export const financialHealthSchema = z.object({
  body: z.object({
    monthly_income: z.number().positive(),
    fixed_expenses: z.number().nonnegative(),
    total_debt: z.number().nonnegative().optional(),
    financial_stress_level: z.number().int().min(1).max(5).optional(),
  }),
});

export const purchaseImpactSchema = z.object({
  body: z.object({
    product_name: z.string().min(1),
    price: z.number().positive(),
    monthly_income: z.number().positive(),
    payment_method: z.enum(['cash', 'financed']).default('cash'),
    installment_months: z.number().int().min(1).max(120).optional(),
    annual_interest_rate: z.number().min(0).max(100).optional(),
    current_expense_ratio: z.number().min(0).max(100).optional(),
  }),
});

export const predictExpensesSchema = z.object({
  query: z.object({
    months: z.coerce.number().int().min(1).max(3).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const concernSchema = z.object({
  body: z.object({
    text: z.string().min(3).max(2000),
  }),
});
