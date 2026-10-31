import { z } from 'zod';

export const StudyCardSchema = z.object({
  wordId: z.string(),
  word: z.string(),
  phonetic: z.string().nullable(),
  pos: z.string(),
  definition: z.string(),
  example: z.string().nullable().optional(),
});

export const QuizTypeSchema = z.enum(['vocab', 'grammar']);

export const QuestionCountSchema = z.union([
  z.literal(10),
  z.literal(20),
  z.literal(30),
]);

export const QuizQuestionsQuerySchema = z.object({
  type: QuizTypeSchema.default('vocab'),
  count: z.coerce.number().int().min(1).max(30).default(10),
  lektionRange: z.string().optional(),
});

export const QuizQuestionSchema = z.object({
  questionId: z.string(),
  type: z.enum(['choice', 'fill']),
  question: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  lektion: z.number().int().nullable().optional(),
  grammarId: z.string().nullable().optional(),
});

export const QuizAnswerDetailSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  questionKind: z.enum(['choice', 'fill']),
  userAnswer: z.string(),
  correctAnswer: z.string(),
  isCorrect: z.boolean(),
  lektion: z.number().int().nullable().optional(),
  grammarId: z.string().nullable().optional(),
});

export const QuizResultSubmitSchema = z.object({
  type: QuizTypeSchema,
  score: z.number().int().min(0).max(100),
  correctCount: z.number().int().min(0),
  totalCount: z.number().int().min(1),
  details: z.array(QuizAnswerDetailSchema).optional(),
});

export type StudyCard = z.infer<typeof StudyCardSchema>;
export type QuizType = z.infer<typeof QuizTypeSchema>;
export type QuestionCount = z.infer<typeof QuestionCountSchema>;
export type QuizQuestionsQuery = z.infer<typeof QuizQuestionsQuerySchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizAnswerDetail = z.infer<typeof QuizAnswerDetailSchema>;
export type QuizResultSubmit = z.infer<typeof QuizResultSubmitSchema>;