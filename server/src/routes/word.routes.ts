import { Router } from 'express';
import { wordController } from '../controllers/word.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);
router.get('/', wordController.list.bind(wordController));
router.get('/:wordId', wordController.detail.bind(wordController));
export default router;