import * as service from '../service/onboarding.service.js';
import { success } from '../../../shared/helpers/response.js';

export async function getStatus(req, res, next) {
  try {
    const data = await service.getOnboardingStatus(req.user.id);
    success(res, data);
  } catch (err) { next(err); }
}

export async function step1(req, res, next) {
  try {
    const data = await service.saveStep1(req.user.id, req.validated.body);
    success(res, data);
  } catch (err) { next(err); }
}

export async function step2(req, res, next) {
  try {
    const data = await service.saveStep2(req.user.id, req.validated.body);
    success(res, data);
  } catch (err) { next(err); }
}

export async function step3(req, res, next) {
  try {
    const data = await service.saveStep3(req.user.id, req.validated.body);
    success(res, data);
  } catch (err) { next(err); }
}

export async function step4(req, res, next) {
  try {
    const data = await service.saveStep4(req.user.id, req.validated.body);
    success(res, data);
  } catch (err) { next(err); }
}

export async function skip(req, res, next) {
  try {
    const data = await service.skipOnboarding(req.user.id);
    success(res, data);
  } catch (err) { next(err); }
}
