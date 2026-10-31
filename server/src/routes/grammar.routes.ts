import { Router } from 'express';
import { grammarController } from '../controllers/grammar.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);
router.get('/', grammarController.list.bind(grammarController));
router.get('/:grammarId', grammarController.detail.bind(grammarController));
export default router;