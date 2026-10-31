import { Router } from 'express';
import { messageController } from '../controllers/message.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/permission';
import { auditMiddleware } from '../middleware/audit';
import { validateBody } from '../middleware/zodValidate';
import { BroadcastRequestSchema } from '@nihao-deutsch/shared';

const router = Router();
router.use(authMiddleware);
router.get('/', messageController.list.bind(messageController));
router.get('/unread-count', messageController.unreadCount.bind(messageController));
router.patch('/:messageId/read', messageController.markRead.bind(messageController));
router.post('/broadcast', requireRole(['teacher']), validateBody(BroadcastRequestSchema), auditMiddleware('broadcast'), messageController.broadcast.bind(messageController));
export default router;