import { z } from 'zod';

export const UserProfileSchema = z.object({
  userId: z.string(),
  name: z.string(),
  avatar: z.string().nullable().optional(),
  className: z.string(),
});

export const StudyStatsSchema = z.object({
  totalWords: z.number().int().nonnegative(),
  masteredWords: z.number().int().nonnegative(),
  weeklyCheckinDays: z.number().int().nonnegative(),
});

export const HeatmapPointSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式 YYYY-MM-DD'),
  level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

export const ReportWeekSchema = z.object({
  weekLabel: z.string(),
  cumulativeWords: z.number().int().nonnegative(),
  masteredWords: z.number().int().nonnegative(),
});

export const WeakGrammarSchema = z.object({
  grammarId: z.string(),
  title: z.string(),
  lektion: z.number().int().nullable(),
  total: z.number().int().nonnegative(),
  wrong: z.number().int().nonnegative(),
  accuracy: z.number().int().min(0).max(100),
});

export const WrongQuestionItemSchema = z.object({
  source: z.enum(['quiz', 'exercise']),
  question: z.string(),
  userAnswer: z.string(),
  correctAnswer: z.string(),
  grammarTitle: z.string().nullable(),
  lektion: z.number().int().nullable(),
  createdAt: z.string(),
});

export const ReportDetailSchema = z.object({
  weakGrammars: z.array(WeakGrammarSchema),
  wrongQuestions: z.array(WrongQuestionItemSchema),
  wrongCount: z.number().int().nonnegative(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type StudyStats = z.infer<typeof StudyStatsSchema>;
export type HeatmapPoint = z.infer<typeof HeatmapPointSchema>;
export type ReportWeek = z.infer<typeof ReportWeekSchema>;
export type WeakGrammar = z.infer<typeof WeakGrammarSchema>;
export type WrongQuestionItem = z.infer<typeof WrongQuestionItemSchema>;
export type ReportDetail = z.infer<typeof ReportDetailSchema>;