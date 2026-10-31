import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@nihao-deutsch/shared';
import { AppError } from './errorHandler';

export function requireRole(roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, '未认证', 'NO_AUTH'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, '无权访问', 'FORBIDDEN'));
      return;
    }
    next();
  };
}