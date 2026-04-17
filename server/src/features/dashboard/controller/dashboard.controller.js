import * as service from '../service/dashboard.service.js';
import { success } from '../../../shared/helpers/response.js';

export async function getSummary(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const summary = await service.getSummary(req.user.id, { startDate, endDate });
    success(res, summary);
  } catch (err) { next(err); }
}

export async function getMonthlyTrend(req, res, next) {
  try {
    const months = parseInt(req.query.months) || 6;
    const { startDate, endDate } = req.query;
    const trend = await service.getMonthlyTrend(req.user.id, { months, startDate, endDate });
    success(res, { trend });
  } catch (err) { next(err); }
}
