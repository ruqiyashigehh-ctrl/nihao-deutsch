import type { Request, Response, NextFunction } from 'express';
import { exerciseService } from '../services/exercise.service';
import { AppError } from '../middleware/errorHandler';

export class ExerciseController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const grammarId = req.query.grammarId as string;
      if (!grammarId) throw new AppError(400, 'grammarId 必填', 'MISSING_PARAM');
      res.json(await exerciseService.getList(grammarId, req.query.type as string | undefined));
    } catch (err) { next(err); }
  }
  async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      const { userAnswer } = req.body;
      res.json(await exerciseService.submit(req.user.userId, req.params.exerciseId, userAnswer));
    } catch (err) { next(err); }
  }
  async records(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await exerciseService.getRecords(req.user.userId));
    } catch (err) { next(err); }
  }
}
export const exerciseController = new ExerciseController();