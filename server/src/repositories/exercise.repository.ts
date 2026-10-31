import { getDatabase } from '../dal/driver';

export class ExerciseRepository {
  async findByGrammar(grammarId: string, type?: string) {
    const db = await getDatabase();
    if (type) {
      return db.query('SELECT * FROM grammar_exercises WHERE grammar_id = ? AND type = ? ORDER BY created_at', [grammarId, type]);
    }
    return db.query('SELECT * FROM grammar_exercises WHERE grammar_id = ? ORDER BY created_at', [grammarId]);
  }
  async findById(exerciseId: string) {
    const db = await getDatabase();
    const rows = await db.query('SELECT * FROM grammar_exercises WHERE exercise_id = ?', [exerciseId]);
    return rows[0] ?? null;
  }
  async findRecord(userId: string, exerciseId: string) {
    const db = await getDatabase();
    const rows = await db.query('SELECT * FROM exercise_records WHERE user_id = ? AND exercise_id = ?', [userId, exerciseId]);
    return rows[0] ?? null;
  }
  async insertRecord(record: { recordId: string; userId: string; exerciseId: string; userAnswer: string; isCorrect: number; submittedAt: string }) {
    const db = await getDatabase();
    await db.run(
      'INSERT INTO exercise_records (record_id, user_id, exercise_id, user_answer, is_correct, submitted_at) VALUES (?, ?, ?, ?, ?, ?)',
      [record.recordId, record.userId, record.exerciseId, record.userAnswer, record.isCorrect, record.submittedAt],
    );
  }
  async findRecordsByUser(userId: string) {
    const db = await getDatabase();
    return db.query(
      `SELECT er.*, ge.question, ge.answer, ge.type, ge.grammar_id
       FROM exercise_records er JOIN grammar_exercises ge ON er.exercise_id = ge.exercise_id
       WHERE er.user_id = ? ORDER BY er.submitted_at DESC`,
      [userId],
    );
  }
}

export const exerciseRepository = new ExerciseRepository();