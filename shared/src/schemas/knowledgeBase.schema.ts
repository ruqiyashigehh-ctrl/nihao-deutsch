import { z } from 'zod';

export const KnowledgeBaseStepSchema = z.object({
  type: z.string(),
  status: z.enum(['success', 'failed', 'skipped']),
  report: z.any().optional(),
  error: z.string().nullable().optional(),
});

export const KnowledgeBaseReportSchema = z.object({
  steps: z.array(KnowledgeBaseStepSchema),
  totalDurationMs: z.number().nonnegative(),
  overallSuccess: z.boolean(),
});

export type KnowledgeBaseStep = z.infer<typeof KnowledgeBaseStepSchema>;
export type KnowledgeBaseReport = z.infer<typeof KnowledgeBaseReportSchema>;