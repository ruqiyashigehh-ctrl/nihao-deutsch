import type { Request, Response, NextFunction } from 'express';
import { profileService } from '../services/profile.service';
import { AppError } from '../middleware/errorHandler';

export class ProfileController {
  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await profileService.getUser(req.user.userId));
    } catch (err) { next(err); }
  }

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await profileService.getStats(req.user.userId));
    } catch (err) { next(err); }
  }

  async getHeatmap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await profileService.getHeatmap(req.user.userId));
    } catch (err) { next(err); }
  }

  async getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await profileService.getReport(req.user.userId));
    } catch (err) { next(err); }
  }

  async getReportDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await profileService.getReportDetail(req.user.userId));
    } catch (err) { next(err); }
  }
}

export const profileController = new ProfileController();