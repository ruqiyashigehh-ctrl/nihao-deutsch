import type { Request, Response, NextFunction } from 'express';
import { templateService } from '../services/template.service';


export class TemplateController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await templateService.list()); } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, title, body, variables } = req.body;
      res.status(201).json(await templateService.create({ code, title, body, variables }));
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, body, variables } = req.body;
      res.json(await templateService.update(req.params.templateId, { title, body, variables }));
    } catch (err) { next(err); }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await templateService.remove(req.params.templateId);
      res.json({ success: true });
    } catch (err) { next(err); }
  }

  async render(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, data } = _req.body;
      res.json(await templateService.render(code, data ?? {}));
    } catch (err) { next(err); }
  }
}

export const templateController = new TemplateController();