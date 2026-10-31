import { z } from 'zod';

export const LoginRequestSchema = z.object({
  studentNo: z.string().min(1, '学号不能为空').max(32, '学号长度不能超过32'),
  password: z.string().min(1, '密码不能为空').max(128, '密码长度不能超过128'),
});

export const LoginResponseSchema = z.object({
  userId: z.string().uuid(),
  studentNo: z.string(),
  name: z.string(),
  classId: z.string().uuid().nullable(),
  role: z.enum(['student', 'teacher', 'admin']),
  isFirstBind: z.boolean(),
  token: z.string(),
});

export const BindRequestSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(64, '姓名长度不能超过64'),
  classId: z.string().uuid().nullable().optional(),
});

export const LogoutResponseSchema = z.object({
  success: z.boolean(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type BindRequest = z.infer<typeof BindRequestSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;