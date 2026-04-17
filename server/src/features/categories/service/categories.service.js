import { prisma } from '../../../configs/prisma.js';
import { NotFoundError, ForbiddenError } from '../../../shared/errors/AppError.js';

export async function getCategories(userId) {
  return prisma.category.findMany({
    where: {
      OR: [{ userId }, { userId: null, isDefault: true }],
      isActive: true,
    },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });
}

export async function createCategory(userId, data) {
  return prisma.category.create({ data: { ...data, userId } });
}

export async function updateCategory(userId, categoryId, data) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || !category.isActive) throw new NotFoundError('Category');
  if (category.userId !== userId) throw new ForbiddenError();

  return prisma.category.update({ where: { id: categoryId }, data });
}

export async function deleteCategory(userId, categoryId) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || !category.isActive) throw new NotFoundError('Category');
  if (category.userId !== userId) throw new ForbiddenError();

  await prisma.category.update({ where: { id: categoryId }, data: { isActive: false } });
}
