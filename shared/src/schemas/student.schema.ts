import { z } from 'zod';
import { QuizTypeSchema, QuestionCountSchema } from './study.schema';

export const NotebookToggleRequestSchema = z.object({
  wordId: z.string().min(1, '单词ID不能为空'),
});

export const NotebookToggleResponseSchema = z.object({
  added: z.boolean(),
});

export const MasteryQuerySchema = z.object({
  lektion: z.coerce.number().int().min(1).max(12),
});

export const LektionMasterySchema = z.object({
  lektion: z.number().int(),
  total: z.number().int().nonnegative(),
  mastered: z.number().int().nonnegative(),
});

export const HomeworkCardSchema = z.object({
  homeworkId: z.string(),
  quizName: z.string(),
  deadline: z.string(),
  status: z.enum(['pending', 'completed']),
});

export const RankTypeSchema = z.enum(['reading', 'vocab']);

export const RankQuerySchema = z.object({
  type: RankTypeSchema.default('reading'),
});

export const RankItemSchema = z.object({
  rank: z.number().int().min(1),
  studentId: z.string(),
  name: z.string(),
  value: z.number().int().nonnegative(),
  isMe: z.boolean().optional(),
});

export const MyRankSchema = z.object({
  rank: z.union([z.number().int().min(1), z.literal('unranked')]),
  name: z.string(),
  value: z.number().int().nonnegative(),
});

export const ClassmateItemSchema = z.object({
  studentId: z.string(),
  name: z.string(),
  studentNo: z.string(),
});

export const PairByCodeRequestSchema = z.object({
  code: z.string().min(4, '邀请码至少4位').max(12, '邀请码最多12位'),
});

export const PairByClassmateRequestSchema = z.object({
  classmateId: z.string().min(1, '同学ID不能为空'),
});

export const PairResponseSchema = z.object({
  paired: z.boolean(),
  pairName: z.string().optional(),
});

export const PublishHomeworkRequestSchema = z.object({
  classIds: z.array(z.string().min(1)).min(1, '至少选择一个班级'),
  lektionRange: z.array(z.number().int().min(1)).default([1]),
  quizType: QuizTypeSchema,
  questionCount: QuestionCountSchema,
  deadline: z.string().min(1, '截止时间不能为空'),
});

export const PublishHomeworkResponseSchema = z.object({
  homeworkId: z.string(),
  targetUserIds: z.array(z.string()),
});

export const ClassInviteCodeSchema = z.object({
  classId: z.string(),
  className: z.string(),
  inviteCode: z.string(),
});

export const InAppPushRequestSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
  templateCode: z.string().min(1, '模板编码不能为空'),
  variables: z.record(z.string()).optional(),
});

export const AttendanceCellPatchSchema = z.object({
  studentId: z.string().min(1, '学生ID不能为空'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式 YYYY-MM-DD'),
  checked: z.boolean(),
});

export type NotebookToggleRequest = z.infer<typeof NotebookToggleRequestSchema>;
export type NotebookToggleResponse = z.infer<typeof NotebookToggleResponseSchema>;
export type MasteryQuery = z.infer<typeof MasteryQuerySchema>;
export type LektionMastery = z.infer<typeof LektionMasterySchema>;
export type HomeworkCard = z.infer<typeof HomeworkCardSchema>;
export type RankType = z.infer<typeof RankTypeSchema>;
export type RankQuery = z.infer<typeof RankQuerySchema>;
export type RankItem = z.infer<typeof RankItemSchema>;
export type MyRank = z.infer<typeof MyRankSchema>;
export type ClassmateItem = z.infer<typeof ClassmateItemSchema>;
export type PairByCodeRequest = z.infer<typeof PairByCodeRequestSchema>;
export type PairByClassmateRequest = z.infer<typeof PairByClassmateRequestSchema>;
export type PairResponse = z.infer<typeof PairResponseSchema>;
export type PublishHomeworkRequest = z.infer<typeof PublishHomeworkRequestSchema>;
export type PublishHomeworkResponse = z.infer<typeof PublishHomeworkResponseSchema>;
export type ClassInviteCode = z.infer<typeof ClassInviteCodeSchema>;
export type InAppPushRequest = z.infer<typeof InAppPushRequestSchema>;
export type AttendanceCellPatch = z.infer<typeof AttendanceCellPatchSchema>;
export const GrammarLektionStatSchema = z.object({
  lektion: z.number().int(),
  accuracy: z.number().int().min(0).max(100),
  answers: z.number().int().nonnegative(),
  participants: z.number().int().nonnegative(),
});

export const GrammarWeakPointSchema = z.object({
  grammarId: z.string(),
  title: z.string(),
  lektion: z.number().int().nullable(),
  accuracy: z.number().int().min(0).max(100),
  wrong: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  participants: z.number().int().nonnegative(),
});

export const GrammarAnalyticsSchema = z.object({
  overall: z.object({
    accuracy: z.number().int().min(0).max(100),
    participants: z.number().int().nonnegative(),
    totalAnswers: z.number().int().nonnegative(),
    studentCount: z.number().int().nonnegative(),
  }),
  byLektion: z.array(GrammarLektionStatSchema),
  weakGrammars: z.array(GrammarWeakPointSchema),
});

export type GrammarLektionStat = z.infer<typeof GrammarLektionStatSchema>;
export type GrammarWeakPoint = z.infer<typeof GrammarWeakPointSchema>;
export type GrammarAnalytics = z.infer<typeof GrammarAnalyticsSchema>;