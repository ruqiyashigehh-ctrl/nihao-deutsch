import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/zodValidate';
import { authMiddleware } from '../middleware/auth';
import { auditMiddleware } from '../middleware/audit';
import { LoginRequestSchema, BindRequestSchema } from '@nihao-deutsch/shared';

const router = Router();

router.post('/login', validateBody(LoginRequestSchema), auditMiddleware('login'), authController.login.bind(authController));
router.get('/classes', authMiddleware, authController.classes.bind(authController));
router.post('/bind', authMiddleware, validateBody(BindRequestSchema), auditMiddleware('bind'), authController.bind.bind(authController));
router.post('/logout', authMiddleware, authController.logout.bind(authController));

export default router;