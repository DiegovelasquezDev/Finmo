import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate.js';
import { validate } from '../../../middlewares/validate.js';
import * as controller from '../controller/analysis.controller.js';
import {
  sentimentSchema,
  financialHealthSchema,
  purchaseImpactSchema,
  predictExpensesSchema,
  concernSchema,
} from '../schemas/analysis.schema.js';

const router = Router();
router.use(authenticate);

router.get('/profile', controller.userProfile);
router.post('/sentiment', validate(sentimentSchema), controller.sentiment);
router.post('/financial-health', validate(financialHealthSchema), controller.financialHealth);
router.get('/spending-pattern', controller.spendingPattern);
router.get('/predict-expenses', validate(predictExpensesSchema), controller.predictExpenses);
router.post('/purchase-impact', validate(purchaseImpactSchema), controller.purchaseImpact);
router.post('/concerns', validate(concernSchema), controller.concerns);
router.get('/score-history', controller.scoreHistory);

export default router;
