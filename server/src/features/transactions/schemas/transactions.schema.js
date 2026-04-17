import { z } from 'zod';

const transactionBody = z.object({
  categoryId: z.string().uuid(),
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive(),
  description: z.string().max(500).optional(),
  date: z.string().datetime(),
  isRecurring: z.boolean().optional(),
  recurrence: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const createTransactionSchema = z.object({ body: transactionBody });

export const updateTransactionSchema = z.object({
  body: transactionBody.partial(),
  params: z.object({ id: z.string().uuid() }),
});

export const listTransactionsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    categoryId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    search: z.string().optional(),
  }),
});

export const transactionParamsSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
