import { z } from 'zod';

const goalBody = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  targetAmount: z.number().positive(),
  deadline: z.string().datetime().optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const createGoalSchema = z.object({ body: goalBody });

export const updateGoalSchema = z.object({
  body: goalBody.extend({
    currentAmount: z.number().min(0).optional(),
    status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']).optional(),
  }).partial(),
  params: z.object({ id: z.string().uuid() }),
});

export const goalParamsSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
