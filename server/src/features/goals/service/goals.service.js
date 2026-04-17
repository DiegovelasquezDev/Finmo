import { prisma } from '../../../configs/prisma.js';
import { NotFoundError, ForbiddenError } from '../../../shared/errors/AppError.js';

export async function listGoals(userId) {
  return prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getGoal(userId, id) {
  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) throw new NotFoundError('Goal');
  if (goal.userId !== userId) throw new ForbiddenError();
  return goal;
}

export async function createGoal(userId, data) {
  return prisma.goal.create({
    data: { ...data, userId, ...(data.deadline && { deadline: new Date(data.deadline) }) },
  });
}

export async function updateGoal(userId, id, data) {
  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) throw new NotFoundError('Goal');
  if (goal.userId !== userId) throw new ForbiddenError();

  return prisma.goal.update({
    where: { id },
    data: { ...data, ...(data.deadline && { deadline: new Date(data.deadline) }) },
  });
}

export async function deleteGoal(userId, id) {
  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) throw new NotFoundError('Goal');
  if (goal.userId !== userId) throw new ForbiddenError();
  await prisma.goal.delete({ where: { id } });
}
