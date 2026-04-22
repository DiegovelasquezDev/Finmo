import * as service from '../service/analysis.service.js';
import { success } from '../../../shared/helpers/response.js';

/** Extract 'es' or 'en' from Accept-Language header, default 'es'. */
function getLang(req) {
  const raw = (req.headers['accept-language'] ?? '').slice(0, 2).toLowerCase();
  return raw === 'en' ? 'en' : 'es';
}

export async function sentiment(req, res, next) {
  try {
    const result = await service.analyzeSentiment(req.body.text, getLang(req));
    success(res, result);
  } catch (err) { next(err); }
}

export async function financialHealth(req, res, next) {
  try {
    const result = await service.analyzeFinancialHealth(req.user.id, req.body, getLang(req));
    success(res, result);
  } catch (err) { next(err); }
}

export async function spendingPattern(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const result = await service.analyzeSpendingPattern(req.user.id, { startDate, endDate }, getLang(req));
    success(res, result);
  } catch (err) { next(err); }
}

export async function predictExpenses(req, res, next) {
  try {
    const months = parseInt(req.query.months) || 1;
    const { startDate, endDate } = req.query;
    const result = await service.predictExpenses(req.user.id, {
      months_to_predict: months,
      startDate,
      endDate,
    }, getLang(req));
    success(res, result);
  } catch (err) { next(err); }
}

export async function userProfile(req, res, next) {
  try {
    const result = await service.analyzeProfile(req.user.id, getLang(req));
    success(res, result);
  } catch (err) { next(err); }
}

export async function purchaseImpact(req, res, next) {
  try {
    const result = await service.analyzePurchaseImpact(req.user.id, req.body, getLang(req));
    success(res, result);
  } catch (err) { next(err); }
}

export async function concerns(req, res, next) {
  try {
    const result = await service.analyzeConcern(req.body.text, getLang(req));
    success(res, result);
  } catch (err) { next(err); }
}

export async function scoreHistory(req, res, next) {
  try {
    const result = await service.getScoreHistory(req.user.id);
    success(res, result);
  } catch (err) { next(err); }
}
