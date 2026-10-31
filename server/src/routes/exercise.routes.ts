import { Router } from 'express';
import { exerciseController } from '../controllers/exercise.controller';
import { authMiddleware } from '../middleware/auth';
import { auditMiddleware } from '../middleware/audit';
import { validateBody } from '../middleware/zodValidate';
import { SubmitAnswerRequestSchema } from '@nihao-deutsch/shared';

const router = Router();
router.use(authMiddleware);
router.get('/', exerciseController.list.bind(exerciseController));
router.post('/:exerciseId/submit', validateBody(SubmitAnswerRequestSchema), auditMiddleware('submit_exercise'), exerciseController.submit.bind(exerciseController));
router.get('/records', exerciseController.records.bind(exerciseController));
export default router;