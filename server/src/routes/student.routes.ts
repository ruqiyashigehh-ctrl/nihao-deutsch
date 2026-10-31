import { Router } from 'express';
import { studentController } from '../controllers/student.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/zodValidate';
import { NotebookToggleRequestSchema, PairByCodeRequestSchema, PairByClassmateRequestSchema } from '@nihao-deutsch/shared';

const router = Router();
router.use(authMiddleware);

router.get('/notebook/ids', studentController.getNotebookIds.bind(studentController));
router.post('/notebook/toggle', validateBody(NotebookToggleRequestSchema), studentController.toggleNotebook.bind(studentController));
router.get('/words/mastery', studentController.getMastery.bind(studentController));
router.get('/class/rank', studentController.getRank.bind(studentController));
router.get('/class/classmates', studentController.getClassmates.bind(studentController));
router.post('/class/pair/code', validateBody(PairByCodeRequestSchema), studentController.pairByCode.bind(studentController));
router.post('/class/pair/classmate', validateBody(PairByClassmateRequestSchema), studentController.pairByClassmate.bind(studentController));
router.get('/homework/pending', studentController.getPendingHomework.bind(studentController));

export default router;