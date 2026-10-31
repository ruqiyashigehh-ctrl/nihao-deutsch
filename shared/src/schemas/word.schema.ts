import { z } from 'zod';

export const DifficultySchema = z.enum(['初级', '中级', '高级']);
export const PartOfSpeechSchema = z.enum([
  '名词', '动词', '形容词', '副词', '代词', '介词', '连词', '数词', '冠词', '感叹词',
]);

export const WordListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  course: z.string().optional(),
  difficulty: DifficultySchema.optional(),
  keyword: z.string().max(64).optional(),
});

export const ConjugationSchema = z.object({
  conjugationId: z.string().uuid(),
  wordId: z.string().uuid(),
  tense: z.string(),
  person: z.string(),
  form: z.string(),
});

export const WordExampleSchema = z.object({
  exampleId: z.string().uuid(),
  wordId: z.string().uuid(),
  german: z.string(),
  translation: z.string(),
});

export const WordListItemSchema = z.object({
  wordId: z.string().uuid(),
  lemma: z.string(),
  phonetic: z.string().nullable(),
  pos: PartOfSpeechSchema,
  meaning: z.string(),
  plural: z.string().nullable(),
  course: z.string(),
  difficulty: DifficultySchema,
});

export const WordDetailSchema = WordListItemSchema.extend({
  conjugations: z.array(ConjugationSchema),
  examples: z.array(WordExampleSchema),
  createdAt: z.string(),
});

export const WordImportSchema = z.object({
  lemma: z.string().min(1, '词条不能为空'),
  phonetic: z.string().nullable().optional(),
  pos: PartOfSpeechSchema,
  meaning: z.string().min(1, '释义不能为空'),
  plural: z.string().nullable().optional(),
  course: z.string().min(1, '课程不能为空'),
  difficulty: DifficultySchema,
  conjugations: z.array(z.object({
    tense: z.string(),
    person: z.string(),
    form: z.string(),
  })).optional().default([]),
  examples: z.array(z.object({
    german: z.string(),
    translation: z.string(),
  })).optional().default([]),
});

export type WordListQuery = z.infer<typeof WordListQuerySchema>;
export type WordListItem = z.infer<typeof WordListItemSchema>;
export type WordDetail = z.infer<typeof WordDetailSchema>;
export type WordImport = z.infer<typeof WordImportSchema>;