import { z } from 'zod';
import { DifficultySchema } from './word.schema';

export const GrammarListQuerySchema = z.object({
  difficulty: DifficultySchema.optional(),
});

export const GrammarListItemSchema = z.object({
  grammarId: z.string().uuid(),
  title: z.string(),
  difficulty: DifficultySchema,
  exerciseAvailable: z.boolean(),
});

export const GrammarExampleSchema = z.object({
  exampleId: z.string().uuid(),
  grammarId: z.string().uuid(),
  german: z.string(),
  translation: z.string(),
});

export const GrammarDetailSchema = GrammarListItemSchema.extend({
  ruleText: z.string().nullable(),
  examples: z.array(GrammarExampleSchema),
  createdAt: z.string(),
});

export const GrammarImportSchema = z.object({
  title: z.string().min(1, '语法点标题不能为空'),
  ruleText: z.string().nullable().optional(),
  difficulty: DifficultySchema,
  examples: z.array(z.object({
    german: z.string(),
    translation: z.string(),
  })).optional().default([]),
  externalId: z.string().optional(),
  book: z.number().int().positive().optional(),
  lektion: z.number().int().positive().optional(),
});

export type GrammarListQuery = z.infer<typeof GrammarListQuerySchema>;
export type GrammarListItem = z.infer<typeof GrammarListItemSchema>;
export type GrammarDetail = z.infer<typeof GrammarDetailSchema>;
export type GrammarImport = z.infer<typeof GrammarImportSchema>;