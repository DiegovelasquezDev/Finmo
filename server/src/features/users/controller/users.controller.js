import * as usersService from '../service/users.service.js';
import { success } from '../../../shared/helpers/response.js';

export async function getProfile(req, res, next) {
  try {
    const user = await usersService.getProfile(req.user.id);
    success(res, { user });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await usersService.updateProfile(req.user.id, req.validated.body);
    success(res, { user });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    await usersService.changePassword(req.user.id, req.validated.body);
    success(res, { message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    await usersService.deleteAccount(req.user.id);
    success(res, { message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
}
