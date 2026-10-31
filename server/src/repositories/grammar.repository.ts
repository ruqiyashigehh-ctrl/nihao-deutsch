import { getDatabase } from '../dal/driver';

export class GrammarRepository {
  async findList(difficulty?: string) {
    const db = await getDatabase();
    if (difficulty) {
      return db.query('SELECT * FROM grammar_points WHERE difficulty = ? ORDER BY title', [difficulty]);
    }
    return db.query('SELECT * FROM grammar_points ORDER BY title');
  }
  async findById(grammarId: string) {
    const db = await getDatabase();
    const points = await db.query('SELECT * FROM grammar_points WHERE grammar_id = ?', [grammarId]);
    if (points.length === 0) return null;
    const examples = await db.query('SELECT * FROM grammar_examples WHERE grammar_id = ?', [grammarId]);
    return { ...points[0], examples };
  }
  async countExercises(grammarId: string) {
    const db = await getDatabase();
    const rows = await db.query<{ cnt: number }>('SELECT COUNT(*) as cnt FROM grammar_exercises WHERE grammar_id = ?', [grammarId]);
    return rows[0]?.cnt ?? 0;
  }
}

export const grammarRepository = new GrammarRepository();