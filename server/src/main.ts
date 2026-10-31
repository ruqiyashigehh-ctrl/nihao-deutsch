import dotenv from 'dotenv';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import https from 'node:https';

dotenv.config({ path: existsSync('.env') ? '.env' : resolve('..', '.env') });

import { createApp } from './app';
import { migrate } from './dal/migrate';
import { seedDemoUsers } from './scripts/seedDemoUsers';
import { seedStudentDemo } from './scripts/seedStudentDemo';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  console.log(`[Sprung] Starting server (NODE_ENV=${env.NODE_ENV}, DB_DRIVER=${env.DB_DRIVER}, HTTPS=${env.HTTPS_ENABLED})`);

  console.log('[Sprung] Running migrations...');
  await migrate();

  if (env.NODE_ENV === 'development') {
    console.log('[Sprung] Seeding demo users...');
    await seedDemoUsers();
    console.log('[Sprung] Seeding student demo data...');
    await seedStudentDemo();
  }

  const app = await createApp();

  if (env.HTTPS_ENABLED && env.HTTPS_CERT_PATH && env.HTTPS_KEY_PATH) {
    const cert = readFileSync(env.HTTPS_CERT_PATH);
    const key = readFileSync(env.HTTPS_KEY_PATH);
    https.createServer({ cert, key }, app).listen(env.PORT, () => {
      console.log(`[Sprung] Server listening on https://localhost:${env.PORT}`);
    });
  } else {
    app.listen(env.PORT, () => {
      console.log(`[Sprung] Server listening on http://localhost:${env.PORT}`);
    });
  }
}

bootstrap().catch((err: any) => {
  const code = err?.code ?? '';
  if (code === 'EADDRINUSE') {
    console.error(`[Sprung] 端口 ${env.PORT} 已被占用，请释放后重试`);
  } else if (code === 'MODULE_NOT_FOUND' || err?.message?.includes('Cannot find module')) {
    console.error('[Sprung] 依赖未安装，请先执行 npm install');
  } else if (err?.message?.includes('migration') || err?.message?.includes('migrate')) {
    console.error('[Sprung] 数据库迁移失败:', err?.message ?? err);
  } else {
    console.error('[Sprung] 启动失败:', err?.message ?? err);
  }
  process.exit(1);
});