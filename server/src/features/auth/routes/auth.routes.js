import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { authLimiter } from '../../../configs/rate-limit.js';
import * as controller from '../controller/auth.controller.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  refreshTokenSchema,
} from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), controller.register);
router.get('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshTokenSchema), controller.refresh);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), controller.resetPassword);
router.post('/logout', authenticate, controller.logout);

export default router;
