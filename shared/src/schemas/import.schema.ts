import { z } from 'zod';

export const ImportTypeSchema = z.enum([
  'words',
  'grammar',
  'exercises',
  'checkpoints',
  'roster',
  'copywriting',
  'windows',
  'grammarExcel',
  'exerciseExcel',
  'windowExcel',
  'copywritingExcel',
  'checkpointExcel',
]);

export const ImportReportSchema = z.object({
  type: ImportTypeSchema,
  total: z.number().int().nonnegative(),
  success: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  failures: z.array(z.object({
    row: z.number().int().positive(),
    field: z.string().nullable(),
    message: z.string(),
  })),
  durationMs: z.number().nonnegative(),
});

export const RosterImportSchema = z.object({
  studentNo: z.string().min(1, '学号不能为空'),
  name: z.string().min(1, '姓名不能为空'),
  role: z.enum(['student', 'teacher', 'admin']),
  className: z.string().nullable().optional(),
  password: z.string().min(6, '密码至少6位').optional(),
});

export const CopywritingImportSchema = z.object({
  key: z.string().min(1, '文案键不能为空'),
  value: z.string().min(1, '文案值不能为空'),
  scene: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  trigger: z.string().nullable().optional(),
  action: z.string().nullable().optional(),
  remark: z.string().nullable().optional(),
});

export type ImportType = z.infer<typeof ImportTypeSchema>;
export type ImportReport = z.infer<typeof ImportReportSchema>;
export type RosterImport = z.infer<typeof RosterImportSchema>;
export type CopywritingImport = z.infer<typeof CopywritingImportSchema>;