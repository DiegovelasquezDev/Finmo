import { prisma } from '../../../configs/prisma.js';
import { NotFoundError, ForbiddenError } from '../../../shared/errors/AppError.js';
import { getPaginationParams } from '../../../shared/helpers/paginate.js';

export async function listTransactions(userId, query) {
  const { page, limit, skip } = getPaginationParams(query);
  const { type, categoryId, startDate, endDate, search } = query;

  const where = {
    userId,
    ...(type && { type }),
    ...(categoryId && { categoryId }),
    ...(startDate || endDate
      ? { date: { ...(startDate && { gte: new Date(startDate) }), ...(endDate && { lte: new Date(endDate) }) } }
      : {}),
    ...(search && { description: { contains: search } }),
  };

  const [data, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { data, page, limit, total };
}

export async function getTransaction(userId, id) {
  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!tx) throw new NotFoundError('Transaction');
  if (tx.userId !== userId) throw new ForbiddenError();
  return tx;
}

export async function createTransaction(userId, data) {
  const { tags, ...rest } = data;
  return prisma.transaction.create({
    data: { ...rest, userId, tags: tags ? JSON.stringify(tags) : undefined, date: new Date(data.date) },
    include: { category: { select: { id: true, name: true, icon: true, color: true } } },
  });
}

export async function updateTransaction(userId, id, data) {
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) throw new NotFoundError('Transaction');
  if (tx.userId !== userId) throw new ForbiddenError();

  const { tags, ...rest } = data;
  return prisma.transaction.update({
    where: { id },
    data: {
      ...rest,
      ...(tags !== undefined && { tags: JSON.stringify(tags) }),
      ...(data.date && { date: new Date(data.date) }),
    },
    include: { category: { select: { id: true, name: true, icon: true, color: true } } },
  });
}

export async function deleteTransaction(userId, id) {
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) throw new NotFoundError('Transaction');
  if (tx.userId !== userId) throw new ForbiddenError();
  await prisma.transaction.delete({ where: { id } });
}
