import { z } from 'zod';

const categoryBody = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  type: z.enum(['INCOME', 'EXPENSE']),
});

export const createCategorySchema = z.object({ body: categoryBody });

export const updateCategorySchema = z.object({
  body: categoryBody.partial(),
  params: z.object({ id: z.string().uuid() }),
});

export const categoryParamsSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
