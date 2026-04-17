import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate.js';
import { validate } from '../../../middlewares/validate.js';
import * as controller from '../controller/onboarding.controller.js';
import { step1Schema, step2Schema, step3Schema, step4Schema } from '../schemas/onboarding.schema.js';

const router = Router();
router.use(authenticate);

router.get('/status',  controller.getStatus);
router.post('/step/1', validate(step1Schema), controller.step1);
router.post('/step/2', validate(step2Schema), controller.step2);
router.post('/step/3', validate(step3Schema), controller.step3);
router.post('/step/4', validate(step4Schema), controller.step4);
router.post('/skip',   controller.skip);

export default router;
