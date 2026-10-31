import { wordRepository } from '../repositories/word.repository';
import { AppError } from '../middleware/errorHandler';

export class WordService {
  async getList(opts: { page: number; pageSize: number; course?: string; difficulty?: string; keyword?: string }) {
    const result = await wordRepository.findList(opts);
    return {
      items: result.items.map((w: any) => ({
        wordId: w.word_id, lemma: w.lemma, phonetic: w.phonetic, pos: w.pos,
        meaning: w.meaning, plural: w.plural, course: w.course, difficulty: w.difficulty,
      })),
      total: result.total, page: opts.page, pageSize: opts.pageSize, hasMore: result.hasMore,
    };
  }

  async getDetail(wordId: string) {
    const word = await wordRepository.findById(wordId);
    if (!word) throw new AppError(404, '单词不存在', 'NOT_FOUND');
    return {
      wordId: word.word_id, lemma: word.lemma, phonetic: word.phonetic, pos: word.pos,
      meaning: word.meaning, plural: word.plural, course: word.course, difficulty: word.difficulty,
      createdAt: word.created_at,
      conjugations: (word.conjugations as any[]).map((c) => ({
        conjugationId: c.conjugation_id, wordId: c.word_id, tense: c.tense, person: c.person, form: c.form,
      })),
      examples: (word.examples as any[]).map((e) => ({
        exampleId: e.example_id, wordId: e.word_id, german: e.german, translation: e.translation,
      })),
    };
  }
}

export const wordService = new WordService();