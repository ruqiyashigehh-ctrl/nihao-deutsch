import { getDatabase } from '../dal/driver';

export interface StudentSummaryRow {
  user_id: string;
  student_no: string;
  name: string;
  class_id: string | null;
  class_name: string | null;
  status: string;
  checkin_count: number;
  exercise_count: number;
  correct_count: number;
}

export interface StudentDetailRow {
  user_id: string;
  student_no: string;
  name: string;
  class_id: string | null;
  class_name: string | null;
  status: string;
  created_at: string;
}

export class TeacherRepository {
  async findTeacherClasses(teacherId: string) {
    const db = await getDatabase();
    return db.query<{ class_id: string; class_name: string }>(
      `SELECT tc.class_id, c.class_name
       FROM teacher_classes tc JOIN classes c ON tc.class_id = c.class_id
       WHERE tc.teacher_id = ? ORDER BY c.class_name`,
      [teacherId],
    );
  }

  async isTeacherOfClass(teacherId: string, classId: string): Promise<boolean> {
    const db = await getDatabase();
    const rows = await db.query<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM teacher_classes WHERE teacher_id = ? AND class_id = ?',
      [teacherId, classId],
    );
    return (rows[0]?.cnt ?? 0) > 0;
  }

  async findStudentsByTeacher(teacherId: string): Promise<StudentSummaryRow[]> {
    const db = await getDatabase();
    return db.query<StudentSummaryRow>(
      `SELECT u.user_id, u.student_no, u.name, u.class_id, c.class_name, u.status,
              (SELECT COUNT(*) FROM check_records cr WHERE cr.user_id = u.user_id) AS checkin_count,
              (SELECT COUNT(*) FROM exercise_records er WHERE er.user_id = u.user_id) AS exercise_count,
              (SELECT COUNT(*) FROM exercise_records er WHERE er.user_id = u.user_id AND er.is_correct = 1) AS correct_count
       FROM users u
       LEFT JOIN classes c ON u.class_id = c.class_id
       JOIN teacher_classes tc ON tc.class_id = u.class_id
       WHERE tc.teacher_id = ? AND u.role = 'student'
       ORDER BY c.class_name, u.student_no`,
      [teacherId],
    );
  }

  async findStudentDetail(studentId: string): Promise<StudentDetailRow | null> {
    const db = await getDatabase();
    const rows = await db.query<StudentDetailRow>(
      `SELECT u.user_id, u.student_no, u.name, u.class_id, c.class_name, u.status, u.created_at
       FROM users u LEFT JOIN classes c ON u.class_id = c.class_id
       WHERE u.user_id = ? AND u.role = 'student'`,
      [studentId],
    );
    return rows[0] ?? null;
  }

  async findStudentCheckinRecords(studentId: string) {
    const db = await getDatabase();
    return db.query(
      `SELECT cr.record_id, cr.checkpoint_id, cr.window_id, cr.latitude, cr.longitude,
              cr.scanned_value, cr.checked_at, cp.name AS checkpoint_name
       FROM check_records cr JOIN checkpoints cp ON cr.checkpoint_id = cp.checkpoint_id
       WHERE cr.user_id = ? ORDER BY cr.checked_at DESC`,
      [studentId],
    );
  }

  async findStudentExerciseRecords(studentId: string) {
    const db = await getDatabase();
    return db.query(
      `SELECT er.record_id, er.exercise_id, er.user_answer, er.is_correct, er.submitted_at,
              ge.question, ge.answer, ge.type, ge.grammar_id, gp.title AS grammar_title
       FROM exercise_records er
       JOIN grammar_exercises ge ON er.exercise_id = ge.exercise_id
       JOIN grammar_points gp ON ge.grammar_id = gp.grammar_id
       WHERE er.user_id = ? ORDER BY er.submitted_at DESC`,
      [studentId],
    );
  }

  async upsertInviteCode(classId: string, inviteCode: string, createdAt: string) {
    const db = await getDatabase();
    await db.run(
      `INSERT INTO class_invite_codes (class_id, invite_code, created_at) VALUES (?, ?, ?)
       ON CONFLICT (class_id) DO NOTHING`,
      [classId, inviteCode, createdAt],
    );
  }

  async findClassStudents(classId: string) {
    const db = await getDatabase();
    return db.query<{ user_id: string; name: string }>(
      `SELECT user_id, name FROM users
       WHERE class_id = ? AND role = 'student' AND status = 'active'
       ORDER BY student_no`,
      [classId],
    );
  }

  async insertHomework(h: {
    homeworkId: string; quizName: string; quizType: string; lektionRange: string;
    questionCount: number; deadline: string; createdBy: string; createdAt: string;
  }) {
    const db = await getDatabase();
    await db.run(
      `INSERT INTO homeworks (homework_id, quiz_name, quiz_type, lektion_range, question_count, deadline, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [h.homeworkId, h.quizName, h.quizType, h.lektionRange, h.questionCount, h.deadline, h.createdBy, h.createdAt],
    );
  }

  async insertHomeworkTargets(homeworkId: string, userIds: string[]) {
    const db = await getDatabase();
    for (const userId of userIds) {
      await db.run(
        'INSERT OR IGNORE INTO homework_targets (homework_id, user_id, completed_at) VALUES (?, ?, NULL)',
        [homeworkId, userId],
      );
    }
  }

  async findAccuracyByLektion(classId: string) {
    const db = await getDatabase();
    return db.query<{ lektion: number; total: number; correct: number }>(
      `SELECT COALESCE(gp.lektion, 1) as lektion,
              COUNT(*) as total,
              SUM(CASE WHEN er.is_correct = 1 THEN 1 ELSE 0 END) as correct
       FROM exercise_records er
       JOIN grammar_exercises ge ON er.exercise_id = ge.exercise_id
       LEFT JOIN grammar_points gp ON ge.grammar_id = gp.grammar_id
       JOIN users u ON er.user_id = u.user_id
       WHERE u.class_id = ?
       GROUP BY COALESCE(gp.lektion, 1)
       ORDER BY lektion`,
      [classId],
    );
  }

  async findAttendanceDates(classId: string, days: number) {
    const db = await getDatabase();
    return db.query<{ d: string; user_id: string }>(
      `SELECT substr(cr.checked_at, 1, 10) as d, cr.user_id
       FROM check_records cr JOIN users u ON cr.user_id = u.user_id
       WHERE u.class_id = ? AND cr.checked_at >= datetime('now', '-${days} days')`,
      [classId],
    );
  }

  async findAttendanceOverrides(classId: string, days: number) {
    const db = await getDatabase();
    return db.query<{ user_id: string; date: string; checked: number }>(
      `SELECT ao.user_id, ao.date, ao.checked
       FROM attendance_overrides ao JOIN users u ON ao.user_id = u.user_id
       WHERE u.class_id = ? AND ao.date >= date('now', '-${days} days')`,
      [classId],
    );
  }

  async upsertAttendanceOverride(userId: string, date: string, checked: number) {
    const db = await getDatabase();
    await db.run(
      `INSERT INTO attendance_overrides (user_id, date, checked) VALUES (?, ?, ?)
       ON CONFLICT (user_id, date) DO UPDATE SET checked = excluded.checked`,
      [userId, date, checked],
    );
  }

  async findClassGrammarStats(classId: string) {
    const db = await getDatabase();
    return db.query<{
      grammar_id: string; title: string; lektion: number | null;
      total: number; correct: number; participants: number;
    }>(
      `SELECT gp.grammar_id, gp.title, gp.lektion,
              COUNT(*) AS total,
              SUM(CASE WHEN er.is_correct = 1 THEN 1 ELSE 0 END) AS correct,
              COUNT(DISTINCT er.user_id) AS participants
       FROM exercise_records er
       JOIN grammar_exercises ge ON er.exercise_id = ge.exercise_id
       JOIN grammar_points gp ON ge.grammar_id = gp.grammar_id
       JOIN users u ON er.user_id = u.user_id
       WHERE u.class_id = ?
       GROUP BY gp.grammar_id
       ORDER BY (SUM(CASE WHEN er.is_correct = 1 THEN 1 ELSE 0 END) * 1.0 / COUNT(*)) ASC`,
      [classId],
    );
  }

  async findClassGrammarByLektion(classId: string) {
    const db = await getDatabase();
    return db.query<{ lektion: number; total: number; correct: number; participants: number }>(
      `SELECT COALESCE(gp.lektion, 1) AS lektion,
              COUNT(*) AS total,
              SUM(CASE WHEN er.is_correct = 1 THEN 1 ELSE 0 END) AS correct,
              COUNT(DISTINCT er.user_id) AS participants
       FROM exercise_records er
       JOIN grammar_exercises ge ON er.exercise_id = ge.exercise_id
       LEFT JOIN grammar_points gp ON ge.grammar_id = gp.grammar_id
       JOIN users u ON er.user_id = u.user_id
       WHERE u.class_id = ?
       GROUP BY COALESCE(gp.lektion, 1)
       ORDER BY lektion`,
      [classId],
    );
  }

  async findClassGrammarOverall(classId: string) {
    const db = await getDatabase();
    const rows = await db.query<{ total: number; correct: number; participants: number }>(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN er.is_correct = 1 THEN 1 ELSE 0 END) AS correct,
              COUNT(DISTINCT er.user_id) AS participants
       FROM exercise_records er
       JOIN users u ON er.user_id = u.user_id
       WHERE u.class_id = ?`,
      [classId],
    );
    return rows[0] ?? { total: 0, correct: 0, participants: 0 };
  }
}

export const teacherRepository = new TeacherRepository();