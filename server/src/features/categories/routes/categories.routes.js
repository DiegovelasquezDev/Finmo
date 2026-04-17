import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate.js';
import { validate } from '../../../middlewares/validate.js';
import * as controller from '../controller/categories.controller.js';
import { createCategorySchema, updateCategorySchema, categoryParamsSchema } from '../schemas/categories.schema.js';

const router = Router();
router.use(authenticate);

router.get('/', controller.list);
router.post('/', validate(createCategorySchema), controller.create);
router.patch('/:id', validate(updateCategorySchema), controller.update);
router.delete('/:id', validate(categoryParamsSchema), controller.remove);

export default router;
