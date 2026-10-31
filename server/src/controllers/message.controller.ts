import type { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/message.service';
import { AppError } from '../middleware/errorHandler';

export class MessageController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      const isRead = req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined;
      res.json(await messageService.getList(req.user.userId, isRead));
    } catch (err) { next(err); }
  }
  async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await messageService.markRead(req.params.messageId); res.json({ success: true }); } catch (err) { next(err); }
  }
  async broadcast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId, title, content } = req.body;
      res.json(await messageService.broadcast(classId, title, content));
    } catch (err) { next(err); }
  }
  async unreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json({ count: await messageService.getUnreadCount(req.user.userId) });
    } catch (err) { next(err); }
  }
}
export const messageController = new MessageController();