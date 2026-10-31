import { getDatabase } from '../dal/driver';

export class WordRepository {
  async findList(opts: { page: number; pageSize: number; course?: string; difficulty?: string; keyword?: string }) {
    const db = await getDatabase();
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (opts.course) { conditions.push('w.course = ?'); params.push(opts.course); }
    if (opts.difficulty) { conditions.push('w.difficulty = ?'); params.push(opts.difficulty); }
    if (opts.keyword) { conditions.push('(w.lemma LIKE ? OR w.meaning LIKE ?)'); params.push(`%${opts.keyword}%`, `%${opts.keyword}%`); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (opts.page - 1) * opts.pageSize;

    const countRows = await db.query<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM words w ${where}`, params);
    const total = countRows[0]?.cnt ?? 0;

    const rows = await db.query(
      `SELECT w.* FROM words w ${where} ORDER BY w.lemma LIMIT ? OFFSET ?`,
      [...params, opts.pageSize, offset],
    );
    return { items: rows, total, hasMore: offset + opts.pageSize < total };
  }

  async findById(wordId: string) {
    const db = await getDatabase();
    const words = await db.query('SELECT * FROM words WHERE word_id = ?', [wordId]);
    if (words.length === 0) return null;
    const conjugations = await db.query('SELECT * FROM conjugations WHERE word_id = ?', [wordId]);
    const examples = await db.query('SELECT * FROM word_examples WHERE word_id = ?', [wordId]);
    return { ...words[0], conjugations, examples };
  }
}

export const wordRepository = new WordRepository();