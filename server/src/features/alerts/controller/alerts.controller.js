import * as service from '../service/alerts.service.js';
import { success, paginated } from '../../../shared/helpers/response.js';

export async function list(req, res, next) {
  try {
    const { data, page, limit, total } = await service.listAlerts(req.user.id, req.query);
    paginated(res, data, { page, limit, total });
  } catch (err) { next(err); }
}

export async function unreadCount(req, res, next) {
  try {
    const count = await service.getUnreadCount(req.user.id);
    success(res, { count });
  } catch (err) { next(err); }
}

export async function markRead(req, res, next) {
  try {
    await service.markAsRead(req.user.id, req.params.id);
    success(res, { message: 'Alert marked as read' });
  } catch (err) { next(err); }
}

export async function markAllRead(req, res, next) {
  try {
    await service.markAllAsRead(req.user.id);
    success(res, { message: 'All alerts marked as read' });
  } catch (err) { next(err); }
}
