import { z } from 'zod';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

dotenv.config({ path: existsSync('.env') ? '.env' : resolve('..', '.env') });

const boolString = z.string().or(z.boolean()).transform((v) => {
  if (typeof v === 'boolean') return v;
  return v === 'true' || v === '1';
});

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  DB_DRIVER: z.enum(['sqlite', 'pg']).default('sqlite'),
  DB_SQLITE_PATH: z.string().default('./data/dev.db'),
  DB_URL: z.string().optional(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET 至少 32 字符'),
  JWT_EXPIRES_IN: z.string().default('8h'),

  LOGIN_FAIL_LOCK_THRESHOLD: z.coerce.number().int().min(1).default(5),
  LOGIN_LOCK_MINUTES: z.coerce.number().int().min(1).default(15),

  HTTPS_ENABLED: boolString.default(false),
  HTTPS_CERT_PATH: z.string().optional(),
  HTTPS_KEY_PATH: z.string().optional(),
  CORS_ORIGIN: z.string().default('*'),

  IMPORT_MAX_MB: z.coerce.number().int().min(1).default(10),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`环境变量校验失败:\n${issues}`);
  }
  return parsed.data;
}

export const env: Env = loadEnv();