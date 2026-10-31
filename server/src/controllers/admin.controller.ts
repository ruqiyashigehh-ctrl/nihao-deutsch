import type { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { AppError } from '../middleware/errorHandler';

export class AdminController {
  async getCheckpoints(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await adminService.getCheckpoints()); } catch (err) { next(err); }
  }

  async createCheckpoint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json(await adminService.createCheckpoint(req.body)); } catch (err) { next(err); }
  }

  async toggleCheckpoint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body as { status?: string };
      if (status !== 'enabled' && status !== 'disabled') {
        throw new AppError(422, '状态值不合法', 'INVALID_BODY');
      }
      await adminService.toggleCheckpoint(req.params.id, status);
      res.json({ updated: true });
    } catch (err) { next(err); }
  }

  async getClasses(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await adminService.getClassesWithTeacher()); } catch (err) { next(err); }
  }

  async bindTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teacherId } = req.body as { teacherId?: string };
      if (!teacherId) throw new AppError(422, '教师ID不能为空', 'INVALID_BODY');
      await adminService.bindTeacher(req.params.classId, teacherId);
      res.json({ updated: true });
    } catch (err) { next(err); }
  }

  async getStudents(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await adminService.getStudentsWithClass()); } catch (err) { next(err); }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await adminService.resetPassword(req.params.userId)); } catch (err) { next(err); }
  }

  async getWords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lektion = Math.max(1, Number(req.query.lektion) || 1);
      res.json(await adminService.getWordsByLektion(lektion));
    } catch (err) { next(err); }
  }

  async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await adminService.getStats()); } catch (err) { next(err); }
  }

  async getTrend(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await adminService.getTrend()); } catch (err) { next(err); }
  }

  async saveGrammarPoint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json(await adminService.saveGrammarPoint(req.body)); } catch (err) { next(err); }
  }
}

export const adminController = new AdminController();