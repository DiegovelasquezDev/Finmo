import * as service from '../service/goals.service.js';
import { success } from '../../../shared/helpers/response.js';

export async function list(req, res, next) {
  try { success(res, { goals: await service.listGoals(req.user.id) }); }
  catch (err) { next(err); }
}

export async function get(req, res, next) {
  try { success(res, { goal: await service.getGoal(req.user.id, req.validated.params.id) }); }
  catch (err) { next(err); }
}

export async function create(req, res, next) {
  try { success(res, { goal: await service.createGoal(req.user.id, req.validated.body) }, 201); }
  catch (err) { next(err); }
}

export async function update(req, res, next) {
  try { success(res, { goal: await service.updateGoal(req.user.id, req.validated.params.id, req.validated.body) }); }
  catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await service.deleteGoal(req.user.id, req.validated.params.id);
    success(res, { message: 'Goal deleted' });
  } catch (err) { next(err); }
}
