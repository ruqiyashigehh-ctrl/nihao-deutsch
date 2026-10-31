import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { getDatabase } from '../dal/driver';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentNo, password } = req.body;
      const result = await authService.login(studentNo, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async bind(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      const { name, classId } = req.body;
      await authService.bind(req.user.userId, name, classId ?? null);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async classes(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const db = await getDatabase();
      const rows = await db.query<{ class_id: string; class_name: string }>(
        'SELECT class_id, class_name FROM classes ORDER BY class_name',
      );
      res.json(rows.map((r) => ({ classId: r.class_id, className: r.class_name })));
    } catch (err) {
      next(err);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logout();
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();