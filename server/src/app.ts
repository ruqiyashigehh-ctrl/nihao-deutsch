import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { requestIdMiddleware } from './middleware/requestId';
import { accessLogMiddleware } from './middleware/accessLog';
import { errorHandler, AppError } from './middleware/errorHandler';
import { getDatabase } from './dal/driver';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export async function createApp(): Promise<express.Application> {
  const app = express();

  app.use(helmet({
    hsts: env.HTTPS_ENABLED ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    contentSecurityPolicy: env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
      },
    } : false,
  }));
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: '1mb' }));
  app.use(requestIdMiddleware);
  app.use(accessLogMiddleware);

  app.get('/health', async (_req, res) => {
    try {
      const db = await getDatabase();
      await db.query('SELECT 1 as ok');
      res.json({ status: 'ok', service: 'nihao-deutsch-server', db: env.DB_DRIVER });
    } catch (err) {
      res.status(503).json({ status: 'degraded', error: String(err) });
    }
  });

  app.get('/health/ready', async (_req, res) => {
    try {
      const db = await getDatabase();
      const checks: { name: string; ready: boolean; count: number; detail: string | null }[] = [];

      const gpCount = (await db.query<{ c: number }>('SELECT COUNT(*) as c FROM grammar_points'))[0]!.c;
      checks.push({ name: 'grammarPoints', ready: gpCount >= 48, count: gpCount, detail: gpCount >= 48 ? null : '需要至少48个语法点' });

      const exCount = (await db.query<{ c: number }>('SELECT COUNT(*) as c FROM grammar_exercises'))[0]!.c;
      checks.push({ name: 'exercises', ready: exCount >= 1500, count: exCount, detail: exCount >= 1500 ? null : '需要至少1500道题目' });

      const cpCount = (await db.query<{ c: number }>('SELECT COUNT(*) as c FROM checkpoints'))[0]!.c;
      checks.push({ name: 'checkpoints', ready: cpCount >= 1, count: cpCount, detail: cpCount >= 1 ? null : '需要至少1个打卡点' });

      const cwCount = (await db.query<{ c: number }>('SELECT COUNT(*) as c FROM check_windows'))[0]!.c;
      checks.push({ name: 'checkWindows', ready: cwCount >= 1, count: cwCount, detail: cwCount >= 1 ? null : '需要至少1个打卡时段' });

      const cwCount2 = (await db.query<{ c: number }>('SELECT COUNT(*) as c FROM copywriting'))[0]!.c;
      checks.push({ name: 'copywriting', ready: cwCount2 >= 50, count: cwCount2, detail: cwCount2 >= 50 ? null : '需要至少50条文案' });

      const studentCount = (await db.query<{ c: number }>("SELECT COUNT(*) as c FROM users WHERE role = 'student'"))[0]!.c;
      const teacherCount = (await db.query<{ c: number }>("SELECT COUNT(*) as c FROM users WHERE role = 'teacher'"))[0]!.c;
      const adminCount = (await db.query<{ c: number }>("SELECT COUNT(*) as c FROM users WHERE role = 'admin'"))[0]!.c;
      const demoReady = studentCount >= 1 && teacherCount >= 1 && adminCount >= 1;
      checks.push({ name: 'demoUsers', ready: demoReady, count: studentCount + teacherCount + adminCount, detail: demoReady ? null : '需要学生/教师/管理员各至少1个' });

      const allReady = checks.every((c) => c.ready);
      res.status(allReady ? 200 : 503).json({
        status: allReady ? 'ready' : 'degraded',
        checks,
      });
    } catch (err) {
      res.status(503).json({ status: 'degraded', error: String(err) });
    }
  });

  app.use('/api/v1', (await import('./routes/index')).default);

  if (env.NODE_ENV === 'production') {
    const staticDir = resolve('..', 'web', 'dist');
    if (existsSync(staticDir)) {
      app.use(express.static(staticDir));
      app.get('*', (_req, res, next) => {
        if (_req.path.startsWith('/api/')) return next();
        res.sendFile(resolve(staticDir, 'index.html'));
      });
      console.log(`[Sprung] Serving static files from ${staticDir}`);
    }
  }

  app.use((_req, _res, next) => {
    next(new AppError(404, '接口不存在', 'NOT_FOUND'));
  });

  app.use(errorHandler);

  return app;
}