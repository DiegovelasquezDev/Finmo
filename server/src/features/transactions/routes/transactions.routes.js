import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate.js';
import { validate } from '../../../middlewares/validate.js';
import * as controller from '../controller/transactions.controller.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsSchema,
  transactionParamsSchema,
} from '../schemas/transactions.schema.js';

const router = Router();
router.use(authenticate);

router.get('/', validate(listTransactionsSchema), controller.list);
router.get('/:id', validate(transactionParamsSchema), controller.get);
router.post('/', validate(createTransactionSchema), controller.create);
router.patch('/:id', validate(updateTransactionSchema), controller.update);
router.delete('/:id', validate(transactionParamsSchema), controller.remove);

export default router;
