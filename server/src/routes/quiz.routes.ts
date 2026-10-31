import { Router } from 'express';
import { studentController } from '../controllers/student.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);
router.get('/questions', studentController.getQuizQuestions.bind(studentController));
router.post('/result', studentController.recordQuiz.bind(studentController));
export default router;