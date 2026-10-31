import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../dal/driver';

export class StudentRepository {
  async findUser(userId: string) {
    const db = await getDatabase();
    const rows = await db.query(
      `SELECT u.user_id, u.student_no, u.name, u.class_id, c.class_name
       FROM users u LEFT JOIN classes c ON u.class_id = c.class_id
       WHERE u.user_id = ?`,
      [userId],
    );
    return rows[0] ?? null;
  }

  async findClassmates(classId: string, excludeUserId: string) {
    const db = await getDatabase();
    return db.query(
      `SELECT user_id, student_no, name FROM users
       WHERE class_id = ? AND user_id != ? AND role = 'student' AND status = 'active'
       ORDER BY student_no`,
      [classId, excludeUserId],
    );
  }

  async findInviteCode(classId: string) {
    const db = await getDatabase();
    const rows = await db.query<{ invite_code: string }>(
      'SELECT invite_code FROM class_invite_codes WHERE class_id = ?',
      [classId],
    );
    return rows[0]?.invite_code ?? null;
  }

  async findNotebookIds(userId: string) {
    const db = await getDatabase();
    const rows = await db.query<{ word_id: string }>(
      'SELECT word_id FROM notebooks WHERE user_id = ? ORDER BY added_at DESC',
      [userId],
    );
    return rows.map((r: { word_id: string }) => r.word_id);
  }

  async findNotebook(userId: string, wordId: string) {
    const db = await getDatabase();
    const rows = await db.query(
      'SELECT word_id FROM notebooks WHERE user_id = ? AND word_id = ?',
      [userId, wordId],
    );
    return rows[0] ?? null;
  }

  async insertNotebook(userId: string, wordId: string, addedAt: string) {
    const db = await getDatabase();
    await db.run(
      'INSERT OR IGNORE INTO notebooks (user_id, word_id, added_at) VALUES (?, ?, ?)',
      [userId, wordId, addedAt],
    );
  }

  async deleteNotebook(userId: string, wordId: string) {
    const db = await getDatabase();
    await db.run('DELETE FROM notebooks WHERE user_id = ? AND word_id = ?', [userId, wordId]);
  }

  async countMastery(userId: string, lektion: number) {
    const db = await getDatabase();
    const totalRows = await db.query<{ c: number }>(
      'SELECT COUNT(*) as c FROM words WHERE lektion = ?',
      [lektion],
    );
    const masteredRows = await db.query<{ c: number }>(
      `SELECT COUNT(*) as c FROM word_mastery m JOIN words w ON m.word_id = w.word_id
       WHERE m.user_id = ? AND w.lektion = ? AND m.mastered = 1`,
      [userId, lektion],
    );
    return { total: totalRows[0]?.c ?? 0, mastered: masteredRows[0]?.c ?? 0 };
  }

  async findRankRows(classId: string) {
    const db = await getDatabase();
    return db.query(
      `SELECT u.user_id, u.name,
              (SELECT COUNT(*) FROM word_mastery m WHERE m.user_id = u.user_id AND m.mastered = 1) AS vocab_count,
              (SELECT COUNT(*) FROM study_records s WHERE s.user_id = u.user_id) AS reading_count
       FROM users u
       WHERE u.class_id = ? AND u.role = 'student' AND u.status = 'active'
       ORDER BY u.student_no`,
      [classId],
    );
  }

  async findPairing(userId: string, pairUserId: string) {
    const db = await getDatabase();
    const rows = await db.query(
      'SELECT partner_id FROM study_pairs WHERE user_id = ? AND partner_id = ?',
      [userId, pairUserId],
    );
    return rows[0] ?? null;
  }

  async insertPairing(userId: string, pairUserId: string, classId: string, createdAt: string) {
    const db = await getDatabase();
    await db.run(
      `INSERT INTO study_pairs (pair_id, class_id, user_id, partner_id, code, created_at)
       VALUES (?, ?, ?, ?, '', ?)
       ON CONFLICT (class_id, user_id) DO UPDATE SET partner_id = excluded.partner_id, created_at = excluded.created_at`,
      [uuidv4(), classId, userId, pairUserId, createdAt],
    );
    await db.run(
      `INSERT INTO study_pairs (pair_id, class_id, user_id, partner_id, code, created_at)
       VALUES (?, ?, ?, ?, '', ?)
       ON CONFLICT (class_id, user_id) DO UPDATE SET partner_id = excluded.partner_id, created_at = excluded.created_at`,
      [uuidv4(), classId, pairUserId, userId, createdAt],
    );
  }

  async findPendingHomework(userId: string) {
    const db = await getDatabase();
    return db.query(
      `SELECT h.homework_id, h.quiz_name, h.deadline, ht.completed_at
       FROM homework_targets ht JOIN homeworks h ON ht.homework_id = h.homework_id
       WHERE ht.user_id = ? AND ht.completed_at IS NULL
       ORDER BY h.deadline`,
      [userId],
    );
  }

  async findStudyWords(userId: string, limit: number) {
    const db = await getDatabase();
    return db.query(
      `SELECT w.word_id, w.lemma, w.phonetic, w.pos, w.meaning,
              (SELECT we.german || '（' || we.translation || '）' FROM word_examples we
               WHERE we.word_id = w.word_id LIMIT 1) AS example
       FROM words w
       WHERE w.lektion <= 2
         AND w.word_id NOT IN (
           SELECT m.word_id FROM word_mastery m WHERE m.user_id = ? AND m.mastered = 1
         )
       ORDER BY w.lektion, w.word_id
       LIMIT ?`,
      [userId, limit],
    );
  }


  async findQuizWords(limit: number, lektionRange?: number[]) {
    const db = await getDatabase();
    if (lektionRange && lektionRange.length > 0) {
      const ph = lektionRange.map(() => '?').join(', ');
      return db.query(
        `SELECT word_id, lemma, pos, meaning, lektion FROM words WHERE lektion IN (${ph}) ORDER BY RANDOM() LIMIT ?`,
        [...lektionRange, limit],
      );
    }
    return db.query(
      'SELECT word_id, lemma, pos, meaning, lektion FROM words ORDER BY RANDOM() LIMIT ?',
      [limit],
    );
  }

  async findQuizExercises(limit: number, lektionRange?: number[]) {
    const db = await getDatabase();
    const base = `SELECT ge.exercise_id, ge.type, ge.question, ge.answer, ge.error_options,
                         ge.grammar_id, COALESCE(gp.lektion, 1) AS lektion
                  FROM grammar_exercises ge
                  JOIN grammar_points gp ON ge.grammar_id = gp.grammar_id`;
    if (lektionRange && lektionRange.length > 0) {
      const ph = lektionRange.map(() => '?').join(', ');
      return db.query(`${base} WHERE gp.lektion IN (${ph}) ORDER BY RANDOM() LIMIT ?`, [...lektionRange, limit]);
    }
    return db.query(`${base} ORDER BY RANDOM() LIMIT ?`, [limit]);
  }

  async countStudyDistinct(userId: string) {
    const db = await getDatabase();
    const rows = await db.query<{ c: number }>(
      'SELECT COUNT(DISTINCT word_id) as c FROM study_records WHERE user_id = ?',
      [userId],
    );
    return rows[0]?.c ?? 0;
  }

  async countMastered(userId: string) {
    const db = await getDatabase();
    const rows = await db.query<{ c: number }>(
      'SELECT COUNT(*) as c FROM word_mastery WHERE user_id = ? AND mastered = 1',
      [userId],
    );
    return rows[0]?.c ?? 0;
  }

  async countWeeklyCheckins(userId: string) {
    const db = await getDatabase();
    const rows = await db.query<{ c: number }>(
      `SELECT COUNT(DISTINCT substr(checked_at, 1, 10)) as c FROM check_records
       WHERE user_id = ? AND checked_at >= datetime('now', '-7 days')`,
      [userId],
    );
    return rows[0]?.c ?? 0;
  }

  async findStudyDates(userId: string, days: number) {
    const db = await getDatabase();
    return db.query<{ d: string; c: number }>(
      `SELECT substr(studied_at, 1, 10) as d, COUNT(*) as c FROM study_records
       WHERE user_id = ? AND studied_at >= datetime('now', '-${days} days')
       GROUP BY d`,
      [userId],
    );
  }

  async findMasteredTimeline(userId: string, days: number) {
    const db = await getDatabase();
    return db.query<{ d: string; c: number }>(
      `SELECT substr(updated_at, 1, 10) as d, COUNT(*) as c FROM word_mastery
       WHERE user_id = ? AND mastered = 1 AND updated_at >= datetime('now', '-${days} days')
       GROUP BY d`,
      [userId],
    );
  }

  async findWeakGrammarsFromExercises(userId: string, minAttempts: number) {
    const db = await getDatabase();
    return db.query<{ grammar_id: string; title: string; lektion: number | null; total: number; wrong: number }>(
      `SELECT gp.grammar_id, gp.title, gp.lektion, COUNT(*) as total,
              SUM(CASE WHEN er.is_correct = 0 THEN 1 ELSE 0 END) as wrong
       FROM exercise_records er
       JOIN grammar_exercises ge ON er.exercise_id = ge.exercise_id
       JOIN grammar_points gp ON ge.grammar_id = gp.grammar_id
       WHERE er.user_id = ?
       GROUP BY gp.grammar_id
       HAVING COUNT(*) >= ?`,
      [userId, minAttempts],
    );
  }

  async findWeakGrammarsFromQuiz(userId: string, minAttempts: number) {
    const db = await getDatabase();
    return db.query<{ grammar_id: string; title: string; lektion: number | null; total: number; wrong: number }>(
      `SELECT gp.grammar_id, gp.title, gp.lektion, COUNT(*) as total,
              SUM(CASE WHEN qa.is_correct = 0 THEN 1 ELSE 0 END) as wrong
       FROM quiz_answers qa
       JOIN grammar_points gp ON qa.grammar_point_id = gp.grammar_id
       WHERE qa.user_id = ? AND qa.quiz_type = 'grammar'
       GROUP BY gp.grammar_id
       HAVING COUNT(*) >= ?`,
      [userId, minAttempts],
    );
  }

  async findWrongFromQuiz(userId: string, limit: number) {
    const db = await getDatabase();
    return db.query<{
      question: string; user_answer: string; correct_answer: string;
      lektion: number | null; created_at: string; grammar_title: string | null;
    }>(
      `SELECT qa.question, qa.user_answer, qa.correct_answer, qa.lektion, qa.created_at,
              gp.title AS grammar_title
       FROM quiz_answers qa
       LEFT JOIN grammar_points gp ON qa.grammar_point_id = gp.grammar_id
       WHERE qa.user_id = ? AND qa.is_correct = 0
       ORDER BY qa.created_at DESC LIMIT ?`,
      [userId, limit],
    );
  }

  async findWrongFromExercises(userId: string, limit: number) {
    const db = await getDatabase();
    return db.query<{
      question: string; user_answer: string; correct_answer: string;
      lektion: number | null; created_at: string; grammar_title: string | null;
    }>(
      `SELECT ge.question, er.user_answer, ge.answer AS correct_answer, gp.lektion,
              er.submitted_at AS created_at, gp.title AS grammar_title
       FROM exercise_records er
       JOIN grammar_exercises ge ON er.exercise_id = ge.exercise_id
       LEFT JOIN grammar_points gp ON ge.grammar_id = gp.grammar_id
       WHERE er.user_id = ? AND er.is_correct = 0
       ORDER BY er.submitted_at DESC LIMIT ?`,
      [userId, limit],
    );
  }

  async countWrongQuestions(userId: string) {
    const db = await getDatabase();
    const quizRow = await db.query<{ c: number }>(
      'SELECT COUNT(*) as c FROM quiz_answers WHERE user_id = ? AND is_correct = 0',
      [userId],
    );
    const exRow = await db.query<{ c: number }>(
      'SELECT COUNT(*) as c FROM exercise_records WHERE user_id = ? AND is_correct = 0',
      [userId],
    );
    return (quizRow[0]?.c ?? 0) + (exRow[0]?.c ?? 0);
  }
}

export const studentRepository = new StudentRepository();