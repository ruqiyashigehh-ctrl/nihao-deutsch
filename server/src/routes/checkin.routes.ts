import { Router } from 'express';
import { checkinController } from '../controllers/checkin.controller';
import { authMiddleware } from '../middleware/auth';
import { auditMiddleware } from '../middleware/audit';
import { validateBody } from '../middleware/zodValidate';
import { CheckinRequestSchema } from '@nihao-deutsch/shared';

const router = Router();
router.use(authMiddleware);
router.get('/checkpoints', checkinController.checkpoints.bind(checkinController));
router.post('/', validateBody(CheckinRequestSchema), auditMiddleware('checkin'), checkinController.checkin.bind(checkinController));
router.get('/records', checkinController.records.bind(checkinController));
export default router;