import { Router } from 'express';
import multer from 'multer';
import { importController } from '../controllers/import.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/permission';
import { auditMiddleware } from '../middleware/audit';
import { env } from '../config/env';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: env.IMPORT_MAX_MB * 1024 * 1024 } });
const router = Router();
router.use(authMiddleware);
router.post('/knowledge-base', requireRole(['admin']), upload.fields([
  { name: 'grammar', maxCount: 1 },
  { name: 'exercises', maxCount: 1 },
  { name: 'checkpoints', maxCount: 1 },
  { name: 'windows', maxCount: 1 },
  { name: 'copywriting', maxCount: 1 },
]), auditMiddleware('importKnowledgeBase'), importController.importKnowledgeBase.bind(importController));
router.post('/:type', requireRole(['admin']), upload.single('file'), auditMiddleware('import'), importController.import.bind(importController));
export default router;