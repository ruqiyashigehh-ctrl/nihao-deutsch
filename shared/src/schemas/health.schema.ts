import { z } from 'zod';

export const ReadinessCheckSchema = z.object({
  name: z.string(),
  ready: z.boolean(),
  count: z.number().int().nonnegative(),
  detail: z.string().nullable().optional(),
});

export const ReadinessReportSchema = z.object({
  status: z.enum(['ready', 'degraded']),
  checks: z.array(ReadinessCheckSchema),
});

export type ReadinessCheck = z.infer<typeof ReadinessCheckSchema>;
export type ReadinessReport = z.infer<typeof ReadinessReportSchema>;