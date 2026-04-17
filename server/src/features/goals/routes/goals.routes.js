import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate.js';
import { validate } from '../../../middlewares/validate.js';
import * as controller from '../controller/goals.controller.js';
import { createGoalSchema, updateGoalSchema, goalParamsSchema } from '../schemas/goals.schema.js';

const router = Router();
router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', validate(goalParamsSchema), controller.get);
router.post('/', validate(createGoalSchema), controller.create);
router.patch('/:id', validate(updateGoalSchema), controller.update);
router.delete('/:id', validate(goalParamsSchema), controller.remove);

export default router;
