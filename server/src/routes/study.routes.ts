import { Router } from 'express';
import { studentController } from '../controllers/student.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);
router.get('/today', studentController.getTodayWords.bind(studentController));
router.post('/result', studentController.recordStudy.bind(studentController));
export default router;