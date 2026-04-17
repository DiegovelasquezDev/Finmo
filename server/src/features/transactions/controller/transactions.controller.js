import * as service from '../service/transactions.service.js';
import { success, paginated } from '../../../shared/helpers/response.js';

export async function list(req, res, next) {
  try {
    const { data, page, limit, total } = await service.listTransactions(req.user.id, req.validated.query);
    paginated(res, data, { page, limit, total });
  } catch (err) { next(err); }
}

export async function get(req, res, next) {
  try {
    const transaction = await service.getTransaction(req.user.id, req.validated.params.id);
    success(res, { transaction });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const transaction = await service.createTransaction(req.user.id, req.validated.body);
    success(res, { transaction }, 201);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const transaction = await service.updateTransaction(req.user.id, req.validated.params.id, req.validated.body);
    success(res, { transaction });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await service.deleteTransaction(req.user.id, req.validated.params.id);
    success(res, { message: 'Transaction deleted' });
  } catch (err) { next(err); }
}
