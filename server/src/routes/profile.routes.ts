import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);
router.get('/user', profileController.getUser.bind(profileController));
router.get('/stats', profileController.getStats.bind(profileController));
router.get('/heatmap', profileController.getHeatmap.bind(profileController));
router.get('/report', profileController.getReport.bind(profileController));
router.get('/report-detail', profileController.getReportDetail.bind(profileController));
export default router;