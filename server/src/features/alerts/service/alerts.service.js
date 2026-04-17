import { prisma } from '../../../configs/prisma.js';
import { getPaginationParams } from '../../../shared/helpers/paginate.js';

export async function listAlerts(userId, query) {
  const { page, limit, skip } = getPaginationParams(query);
  const where = { userId, ...(query.isRead !== undefined && { isRead: query.isRead === 'true' }) };

  const [data, total] = await prisma.$transaction([
    prisma.alert.findMany({ where, orderBy: { triggeredAt: 'desc' }, skip, take: limit }),
    prisma.alert.count({ where }),
  ]);

  return { data, page, limit, total };
}

export async function markAsRead(userId, alertId) {
  return prisma.alert.updateMany({
    where: { id: alertId, userId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllAsRead(userId) {
  return prisma.alert.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function createAlert(userId, data) {
  return prisma.alert.create({ data: { ...data, userId } });
}

export async function getUnreadCount(userId) {
  return prisma.alert.count({ where: { userId, isRead: false } });
}
