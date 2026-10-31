import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/permission';
import { auditMiddleware } from '../middleware/audit';

const router = Router();
router.use(authMiddleware);
router.use(requireRole(['admin']));

router.get('/checkin-points', adminController.getCheckpoints.bind(adminController));
router.post('/checkin-points', auditMiddleware('createCheckpoint'), adminController.createCheckpoint.bind(adminController));
router.patch('/checkin-points/:id/status', auditMiddleware('toggleCheckpoint'), adminController.toggleCheckpoint.bind(adminController));

router.get('/classes', adminController.getClasses.bind(adminController));
router.put('/classes/:classId/teacher', auditMiddleware('bindTeacher'), adminController.bindTeacher.bind(adminController));

router.get('/students', adminController.getStudents.bind(adminController));
router.post('/students/:userId/reset-password', auditMiddleware('resetPassword'), adminController.resetPassword.bind(adminController));

router.get('/words', adminController.getWords.bind(adminController));

router.get('/dashboard/stats', adminController.getStats.bind(adminController));
router.get('/dashboard/trend', adminController.getTrend.bind(adminController));

router.post('/grammar-points', auditMiddleware('saveGrammarPoint'), adminController.saveGrammarPoint.bind(adminController));

export default router;