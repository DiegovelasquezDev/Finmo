import * as service from '../service/categories.service.js';
import { success } from '../../../shared/helpers/response.js';

export async function list(req, res, next) {
  try {
    const categories = await service.getCategories(req.user.id);
    success(res, { categories });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const category = await service.createCategory(req.user.id, req.validated.body);
    success(res, { category }, 201);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const category = await service.updateCategory(req.user.id, req.validated.params.id, req.validated.body);
    success(res, { category });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await service.deleteCategory(req.user.id, req.validated.params.id);
    success(res, { message: 'Category deleted' });
  } catch (err) { next(err); }
}
