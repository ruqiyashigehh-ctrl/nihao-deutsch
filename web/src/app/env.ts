import { z } from 'zod';

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://localhost:3000/api/v1'),
  VITE_PLATFORM: z.enum(['h5', 'welink']).default('h5'),
  VITE_USE_MOCK: z
    .union([z.boolean(), z.string().transform((v) => v === 'true')])
    .default(true),
});

type EnvConfig = z.infer<typeof EnvSchema>;

function loadEnv(): EnvConfig {
  const parsed = EnvSchema.safeParse(import.meta.env);
  if (!parsed.success) {
    console.warn('环境变量校验警告:', parsed.error.issues);
    return { VITE_API_BASE_URL: 'http://localhost:3000/api/v1', VITE_PLATFORM: 'h5', VITE_USE_MOCK: true };
  }
  return parsed.data;
}

export const env = loadEnv();
export const PLATFORM = env.VITE_PLATFORM;
export const API_BASE_URL = env.VITE_API_BASE_URL;
export const USE_MOCK = env.VITE_USE_MOCK;