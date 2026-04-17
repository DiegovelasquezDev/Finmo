import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate.js';
import * as controller from '../controller/alerts.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', controller.list);
router.get('/unread-count', controller.unreadCount);
router.patch('/read-all', controller.markAllRead);
router.patch('/:id/read', controller.markRead);

export default router;
