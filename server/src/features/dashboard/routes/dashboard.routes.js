import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate.js';
import * as controller from '../controller/dashboard.controller.js';

const router = Router();
router.use(authenticate);

router.get('/summary', controller.getSummary);
router.get('/monthly-trend', controller.getMonthlyTrend);

export default router;
