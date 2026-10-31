import { getDatabase } from '../dal/driver';

export class AdminRepository {
  async findCheckpoints() {
    const db = await getDatabase();
    return db.query(
      `SELECT checkpoint_id, name, latitude, longitude, radius, is_active
       FROM checkpoints ORDER BY created_at, name`,
    );
  }

  async insertCheckpoint(c: {
    checkpointId: string; name: string; latitude: number; longitude: number;
    radius: number; isActive: number; createdAt: string;
  }) {
    const db = await getDatabase();
    await db.run(
      `INSERT INTO checkpoints (checkpoint_id, name, latitude, longitude, radius, require_scan, created_at, is_active)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [c.checkpointId, c.name, c.latitude, c.longitude, c.radius, c.createdAt, c.isActive],
    );
  }

  async updateCheckpointStatus(checkpointId: string, isActive: number) {
    const db = await getDatabase();
    await db.run('UPDATE checkpoints SET is_active = ? WHERE checkpoint_id = ?', [isActive, checkpointId]);
  }

  async findCheckpointByName(name: string) {
    const db = await getDatabase();
    const rows = await db.query('SELECT checkpoint_id FROM checkpoints WHERE name = ?', [name]);
    return rows[0] ?? null;
  }

  async findClassesWithTeacher() {
    const db = await getDatabase();
    return db.query(
      `SELECT c.class_id, c.class_name, cic.invite_code,
              (SELECT u.user_id FROM teacher_classes tc JOIN users u ON tc.teacher_id = u.user_id
               WHERE tc.class_id = c.class_id LIMIT 1) AS teacher_id,
              (SELECT u.name FROM teacher_classes tc JOIN users u ON tc.teacher_id = u.user_id
               WHERE tc.class_id = c.class_id LIMIT 1) AS teacher_name
       FROM classes c LEFT JOIN class_invite_codes cic ON cic.class_id = c.class_id
       ORDER BY c.created_at`,
    );
  }

  async findTeachers() {
    const db = await getDatabase();
    return db.query<{ user_id: string; name: string }>(
      "SELECT user_id, name FROM users WHERE role = 'teacher' AND status = 'active' ORDER BY student_no",
    );
  }

  async bindTeacher(classId: string, teacherId: string) {
    const db = await getDatabase();
    await db.run('DELETE FROM teacher_classes WHERE class_id = ?', [classId]);
    await db.run('INSERT OR IGNORE INTO teacher_classes (teacher_id, class_id) VALUES (?, ?)', [teacherId, classId]);
  }

  async findStudentsWithClass() {
    const db = await getDatabase();
    return db.query(
      `SELECT u.user_id, u.student_no, u.name, u.class_id, c.class_name
       FROM users u LEFT JOIN classes c ON u.class_id = c.class_id
       WHERE u.role = 'student'
       ORDER BY u.student_no`,
    );
  }

  async updateUserPassword(userId: string, passwordHash: string, updatedAt: string) {
    const db = await getDatabase();
    await db.run(
      'UPDATE users SET password_hash = ?, fail_count = 0, locked_until = NULL, updated_at = ? WHERE user_id = ?',
      [passwordHash, updatedAt, userId],
    );
  }

  async findWordsByLektion(lektion: number) {
    const db = await getDatabase();
    return db.query(
      'SELECT word_id, lemma, phonetic, pos, meaning, plural, course, difficulty, lektion FROM words WHERE lektion = ? ORDER BY word_id',
      [lektion],
    );
  }

  async findDashboardStats() {
    const db = await getDatabase();
    const users = await db.query<{ c: number }>('SELECT COUNT(*) as c FROM users');
    const students = await db.query<{ c: number }>("SELECT COUNT(*) as c FROM users WHERE role = 'student'");
    const todayCheckins = await db.query<{ c: number }>(
      "SELECT COUNT(DISTINCT user_id) as c FROM check_records WHERE substr(checked_at, 1, 10) = date('now')",
    );
    const todayStudy = await db.query<{ c: number }>(
      "SELECT COUNT(*) as c FROM study_records WHERE substr(studied_at, 1, 10) = date('now')",
    );
    const todayQuiz = await db.query<{ c: number }>(
      "SELECT COUNT(*) as c FROM quiz_records WHERE substr(submitted_at, 1, 10) = date('now')",
    );
    const studentCount = students[0]?.c ?? 0;
    return {
      totalUsers: users[0]?.c ?? 0,
      todayCheckinRate: studentCount > 0 ? Math.round(((todayCheckins[0]?.c ?? 0) / studentCount) * 100) : 0,
      todayAvgWords: studentCount > 0 ? Math.round(((todayStudy[0]?.c ?? 0) / studentCount) * 10) / 10 : 0,
      todayQuizCount: todayQuiz[0]?.c ?? 0,
    };
  }

  async findCheckinTrend(days: number) {
    const db = await getDatabase();
    return db.query<{ d: string; c: number }>(
      `SELECT substr(checked_at, 1, 10) as d, COUNT(DISTINCT user_id) as c
       FROM check_records
       WHERE checked_at >= datetime('now', '-${days} days')
       GROUP BY d ORDER BY d`,
    );
  }

  async insertGrammarPoint(g: {
    grammarId: string; title: string; ruleText: string; difficulty: string;
    exerciseAvailable: number; createdAt: string;
  }) {
    const db = await getDatabase();
    await db.run(
      `INSERT INTO grammar_points (grammar_id, title, rule_text, difficulty, exercise_available, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [g.grammarId, g.title, g.ruleText, g.difficulty, g.exerciseAvailable, g.createdAt],
    );
  }

  async insertGrammarExercise(e: {
    exerciseId: string; grammarId: string; type: string; question: string;
    answer: string; explanation: string | null; difficulty: string; createdAt: string;
  }) {
    const db = await getDatabase();
    await db.run(
      `INSERT INTO grammar_exercises (exercise_id, grammar_id, type, question, answer, explanation, difficulty, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [e.exerciseId, e.grammarId, e.type, e.question, e.answer, e.explanation, e.difficulty, e.createdAt],
    );
  }
}

export const adminRepository = new AdminRepository();