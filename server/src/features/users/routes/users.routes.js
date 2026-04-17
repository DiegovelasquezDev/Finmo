import { Router } from 'express';
import { authenticate, requireVerified } from '../../../middlewares/authenticate.js';
import { validate } from '../../../middlewares/validate.js';
import * as controller from '../controller/users.controller.js';
import { updateProfileSchema, changePasswordSchema } from '../schemas/users.schema.js';

const router = Router();
router.use(authenticate);

router.get('/me', controller.getProfile);
router.patch('/me', validate(updateProfileSchema), controller.updateProfile);
router.patch('/me/password', validate(changePasswordSchema), controller.changePassword);
router.delete('/me', controller.deleteAccount);

export default router;
