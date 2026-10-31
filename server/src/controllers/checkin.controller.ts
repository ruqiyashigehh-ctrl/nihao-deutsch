import type { Request, Response, NextFunction } from 'express';
import { checkinService } from '../services/checkin.service';
import { AppError } from '../middleware/errorHandler';

export class CheckinController {
  async checkpoints(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await checkinService.getCheckpoints()); } catch (err) { next(err); }
  }
  async checkin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await checkinService.checkin(req.user.userId, req.body));
    } catch (err) { next(err); }
  }
  async records(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!_req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await checkinService.getRecords(_req.user.userId));
    } catch (err) { next(err); }
  }
}
export const checkinController = new CheckinController();