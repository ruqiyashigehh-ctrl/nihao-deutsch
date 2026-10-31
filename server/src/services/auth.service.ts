import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository, type UserRow } from '../repositories/user.repository';
import { getDatabase } from '../dal/driver';
import { env } from '../config/env';
import { nowIso, minutesFromNow, isExpired } from '../dal/types';
import { AppError } from '../middleware/errorHandler';
import type { JwtPayload } from '../middleware/auth';
import type { Role } from '@nihao-deutsch/shared';

export interface LoginResult {
  userId: string;
  studentNo: string;
  name: string;
  classId: string | null;
  role: Role;
  isFirstBind: boolean;
  token: string;
}

export class AuthService {
  async login(studentNo: string, password: string): Promise<LoginResult> {
    const user = await userRepository.findByStudentNo(studentNo);
    if (!user) {
      throw new AppError(401, '学号或密码错误', 'LOGIN_FAILED');
    }

    if (user.status === 'disabled') {
      throw new AppError(403, '账号已禁用', 'ACCOUNT_DISABLED');
    }

    if (user.lockedUntil && !isExpired(user.lockedUntil)) {
      const remainingMs = new Date(user.lockedUntil).getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60_000);
      throw new AppError(423, `账号已锁定，请 ${remainingMin} 分钟后重试`, 'ACCOUNT_LOCKED', { remainingMinutes: remainingMin });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      const newFailCount = user.failCount + 1;
      const shouldLock = newFailCount >= env.LOGIN_FAIL_LOCK_THRESHOLD;
      await userRepository.updateFailCount(
        user.userId,
        newFailCount,
        shouldLock ? minutesFromNow(env.LOGIN_LOCK_MINUTES) : null,
      );
      if (shouldLock) {
        throw new AppError(423, `账号已锁定，请 ${env.LOGIN_LOCK_MINUTES} 分钟后重试`, 'ACCOUNT_LOCKED', { remainingMinutes: env.LOGIN_LOCK_MINUTES });
      }
      throw new AppError(401, '学号或密码错误', 'LOGIN_FAILED');
    }

    await userRepository.resetFailCount(user.userId);

    const payload: JwtPayload = {
      userId: user.userId,
      studentNo: user.studentNo,
      role: user.role,
    };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

    return {
      userId: user.userId,
      studentNo: user.studentNo,
      name: user.name,
      classId: user.classId,
      role: user.role,
      isFirstBind: user.isFirstBind,
      token,
    };
  }

  async bind(userId: string, name: string, classId: string | null): Promise<void> {
    if (classId) {
      const db = await getDatabase();
      const classes = await db.query<{ class_id: string }>(
        'SELECT class_id FROM classes WHERE class_id = ?',
        [classId],
      );
      if (classes.length === 0) {
        throw new AppError(422, '班级不存在', 'CLASS_NOT_FOUND');
      }
    }
    await userRepository.updateBindStatus(userId, name, classId);
  }

  async logout(): Promise<void> {
    // JWT 无状态，客户端清除 token 即可
  }
}

export const authService = new AuthService();