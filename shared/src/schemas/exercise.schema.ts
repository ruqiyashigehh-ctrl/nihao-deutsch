import { z } from 'zod';
import { DifficultySchema } from './word.schema';

export const ExerciseTypeSchema = z.enum(['G1', 'G2']);

export const ExerciseListQuerySchema = z.object({
  grammarId: z.string().uuid(),
  type: ExerciseTypeSchema.optional(),
});

export const ExerciseItemSchema = z.object({
  exerciseId: z.string().uuid(),
  grammarId: z.string().uuid(),
  type: ExerciseTypeSchema,
  question: z.string(),
  difficulty: DifficultySchema,
});

export const SubmitAnswerRequestSchema = z.object({
  userAnswer: z.string().min(1, '作答不能为空'),
});

export const SubmitAnswerResponseSchema = z.object({
  recordId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  isCorrect: z.boolean(),
  correctAnswer: z.string(),
  explanation: z.string().nullable(),
  submittedAt: z.string(),
});

export const ExerciseRecordSchema = z.object({
  recordId: z.string().uuid(),
  userId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  userAnswer: z.string(),
  isCorrect: z.boolean(),
  submittedAt: z.string(),
});

export const ExerciseImportSchema = z.object({
  grammarId: z.string().uuid(),
  type: ExerciseTypeSchema,
  question: z.string().min(1, '题干不能为空'),
  answer: z.string().min(1, '答案不能为空'),
  explanation: z.string().nullable().optional(),
  difficulty: DifficultySchema,
  externalId: z.string().optional(),
  grammarExternalId: z.string().optional(),
  errorWordIndex: z.number().int().optional(),
  errorOptions: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
});

export type ExerciseListQuery = z.infer<typeof ExerciseListQuerySchema>;
export type ExerciseItem = z.infer<typeof ExerciseItemSchema>;
export type SubmitAnswerRequest = z.infer<typeof SubmitAnswerRequestSchema>;
export type SubmitAnswerResponse = z.infer<typeof SubmitAnswerResponseSchema>;
export type ExerciseRecord = z.infer<typeof ExerciseRecordSchema>;
export type ExerciseImport = z.infer<typeof ExerciseImportSchema>;