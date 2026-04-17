import * as authService from '../service/auth.service.js';
import { success } from '../../../shared/helpers/response.js';

export async function register(req, res, next) {
  try {
    const user = await authService.register(req.validated.body);
    success(res, { user }, 201);
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    await authService.verifyEmail(req.validated.query.token);
    success(res, { message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const data = await authService.login(req.validated.body);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const tokens = await authService.refreshTokens(req.validated.body.refreshToken);
    success(res, tokens);
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    await authService.forgotPassword(req.validated.body.email);
    success(res, { message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req.validated.body);
    success(res, { message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logout(req.user.id, req.body.refreshToken);
    success(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}
