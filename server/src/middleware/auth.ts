import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';
import type { Role } from '@nihao-deutsch/shared';

export interface JwtPayload {
  userId: string;
  studentNo: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) {
    next(new AppError(401, '未携带认证令牌', 'NO_TOKEN'));
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, '登录已过期，请重新登录', 'TOKEN_EXPIRED'));
  }
}