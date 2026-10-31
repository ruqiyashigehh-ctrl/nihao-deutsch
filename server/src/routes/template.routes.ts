import { Router } from 'express';
import { templateController } from '../controllers/template.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/permission';
import { auditMiddleware } from '../middleware/audit';
import { validateBody } from '../middleware/zodValidate';
import { CreateTemplateSchema, UpdateTemplateSchema, RenderTemplateSchema } from '@nihao-deutsch/shared';

const router = Router();
router.use(authMiddleware);
router.use(requireRole(['admin']));

router.get('/', templateController.list.bind(templateController));
router.post('/', validateBody(CreateTemplateSchema), auditMiddleware('template.create'), templateController.create.bind(templateController));
router.put('/:templateId', validateBody(UpdateTemplateSchema), auditMiddleware('template.update'), templateController.update.bind(templateController));
router.delete('/:templateId', auditMiddleware('template.delete'), templateController.remove.bind(templateController));
router.post('/render', validateBody(RenderTemplateSchema), templateController.render.bind(templateController));

export default router;