import { grammarRepository } from '../repositories/grammar.repository';
import { AppError } from '../middleware/errorHandler';
import { toBool } from '../dal/types';

export class GrammarService {
  async getList(difficulty?: string) {
    const rows = await grammarRepository.findList(difficulty);
    return rows.map((g: any) => ({
      grammarId: g.grammar_id, title: g.title, difficulty: g.difficulty,
      exerciseAvailable: toBool(g.exercise_available),
    }));
  }
  async getDetail(grammarId: string) {
    const g = await grammarRepository.findById(grammarId);
    if (!g) throw new AppError(404, '语法点不存在', 'NOT_FOUND');
    return {
      grammarId: g.grammar_id, title: g.title, ruleText: g.rule_text, difficulty: g.difficulty,
      exerciseAvailable: toBool(g.exercise_available), createdAt: g.created_at,
      examples: (g.examples as any[]).map((e) => ({
        exampleId: e.example_id, grammarId: e.grammar_id, german: e.german, translation: e.translation,
      })),
    };
  }
}

export const grammarService = new GrammarService();