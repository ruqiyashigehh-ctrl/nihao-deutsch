import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../dal/driver';
import { nowIso } from '../dal/types';

const DEMO_CLASS_ID = '00000000-0000-0000-0000-000000000010';
const DEMO_INVITE_CODE = 'DEMO01';

const CLASSMATES = [
  { studentNo: '20240002', name: '李明' },
  { studentNo: '20240003', name: '王芳' },
  { studentNo: '20240004', name: '张浩然' },
  { studentNo: '20240005', name: '刘思远' },
  { studentNo: '20240006', name: '陈嘉怡' },
  { studentNo: '20240007', name: '杨子墨' },
  { studentNo: '20240008', name: '赵晨曦' },
  { studentNo: '20240009', name: '周雅琪' },
  { studentNo: '20240010', name: '吴承宇' },
  { studentNo: '20240011', name: '徐若涵' },
  { studentNo: '20240012', name: '孙志强' },
  { studentNo: '20240013', name: '林晓月' },
];

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function isoAt(daysAgo: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export async function seedStudentDemo(): Promise<void> {
  const db = await getDatabase();
  const now = nowIso();

  await db.run(
    `INSERT INTO class_invite_codes (class_id, invite_code, created_at) VALUES (?, ?, ?)
     ON CONFLICT (class_id) DO NOTHING`,
    [DEMO_CLASS_ID, DEMO_INVITE_CODE, now],
  );

  const existing = await db.query<{ user_id: string; student_no: string }>(
    `SELECT user_id, student_no FROM users WHERE class_id = ? AND role = 'student' AND status = 'active'`,
    [DEMO_CLASS_ID],
  );
  const existingByNo = new Map(existing.map((u: { user_id: string; student_no: string }) => [u.student_no, u.user_id]));

  const passwordHash = await bcrypt.hash('demo123456', 10);
  for (const mate of CLASSMATES) {
    if (existingByNo.has(mate.studentNo)) continue;
    const userId = uuidv4();
    await db.run(
      `INSERT INTO users (user_id, student_no, name, class_id, role, password_hash, is_first_bind, fail_count, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'student', ?, 0, 0, 'active', ?, ?)`,
      [userId, mate.studentNo, mate.name, DEMO_CLASS_ID, passwordHash, now, now],
    );
    existingByNo.set(mate.studentNo, userId);
    console.log(`[seed] classmate ${mate.studentNo} (${mate.name}) created`);
  }

  const studentIds = [...existingByNo.values()];
  if (studentIds.length === 0) {
    console.log('[seed] no students in demo class, skip');
    return;
  }

  const masteryTotal = await db.query<{ c: number }>('SELECT COUNT(*) as c FROM word_mastery');
  if ((masteryTotal[0]?.c ?? 0) === 0) {
    const wordRows = await db.query<{ word_id: string; lektion: number }>(
      'SELECT word_id, lektion FROM words WHERE lektion <= 2 ORDER BY word_id',
    );
    if (wordRows.length > 0) {
      let total = 0;
      for (let i = 0; i < studentIds.length; i++) {
        const userId = studentIds[i];
        const rand = seededRandom(3000 + i * 211);
        const count = i === 0 ? 60 : 10 + Math.floor(rand() * 30);
        const shuffled = [...wordRows];
        for (let j = shuffled.length - 1; j > 0; j--) {
          const k = Math.floor(rand() * (j + 1));
          [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
        }
        for (const w of shuffled.slice(0, count)) {
          const at = isoAt(Math.floor(rand() * 20), 9, 30);
          await db.run(
            'INSERT OR IGNORE INTO word_mastery (user_id, word_id, mastered, updated_at) VALUES (?, ?, 1, ?)',
            [userId, w.word_id, at],
          );
          await db.run(
            'INSERT INTO study_records (record_id, user_id, word_id, status, studied_at) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), userId, w.word_id, 'known', at],
          );
          total++;
        }
      }
      console.log(`[seed] created ${total} word_mastery + study_records`);
    }
  }

  const checkinTotal = await db.query<{ c: number }>('SELECT COUNT(*) as c FROM check_records');
  if ((checkinTotal[0]?.c ?? 0) === 0) {
    const weekdays: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const w = d.getDay();
      if (w !== 0 && w !== 6) weekdays.push(i);
    }
    let total = 0;
    for (let i = 0; i < studentIds.length; i++) {
      const userId = studentIds[i];
      const d1 = new Date();
      d1.setDate(d1.getDate() - weekdays[i % weekdays.length]);
      d1.setHours(8, 30, 0, 0);
      await db.run(
        `INSERT OR IGNORE INTO check_records (record_id, user_id, checkpoint_id, window_id, latitude, longitude, scanned_value, checked_at)
         VALUES (?, ?, '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000030', 31.284800, 121.554100, NULL, ?)`,
        [uuidv4(), userId, d1.toISOString()],
      );
      const d2 = new Date();
      d2.setDate(d2.getDate() - weekdays[(i + 2) % weekdays.length]);
      d2.setHours(9, 5, 0, 0);
      await db.run(
        `INSERT OR IGNORE INTO check_records (record_id, user_id, checkpoint_id, window_id, latitude, longitude, scanned_value, checked_at)
         VALUES (?, ?, '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000031', 31.285600, 121.554100, NULL, ?)`,
        [uuidv4(), userId, d2.toISOString()],
      );
      total += 2;
    }
    console.log(`[seed] created ${total} check_records`);
  }

  const studyCount = await db.query<{ c: number }>('SELECT COUNT(*) as c FROM study_records');
  if ((studyCount[0]?.c ?? 0) === 0) {
    const masteryRows = await db.query<{ user_id: string; word_id: string; updated_at: string }>(
      'SELECT user_id, word_id, updated_at FROM word_mastery',
    );
    for (const m of masteryRows) {
      await db.run(
        'INSERT INTO study_records (record_id, user_id, word_id, status, studied_at) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), m.user_id, m.word_id, 'known', m.updated_at],
      );
    }
    console.log(`[seed] derived ${masteryRows.length} study_records from word_mastery`);
  }

  const exRecordTotal = await db.query<{ c: number }>('SELECT COUNT(*) as c FROM exercise_records');
  const focusedRows = await db.query<{ c: number }>(
    `SELECT COUNT(*) as c FROM (
       SELECT ge.grammar_id FROM exercise_records er
       JOIN grammar_exercises ge ON er.exercise_id = ge.exercise_id
       GROUP BY er.user_id, ge.grammar_id HAVING COUNT(*) >= 3
     )`,
  );
  const needRebuildExercises = (exRecordTotal[0]?.c ?? 0) === 0 || (focusedRows[0]?.c ?? 0) === 0;
  if (needRebuildExercises) {
    if ((exRecordTotal[0]?.c ?? 0) > 0) {
      await db.run('DELETE FROM exercise_records');
      console.log('[seed] 旧版分散练习记录已清理，改为按语法点集中重建');
    }
    const exerciseRows = await db.query<{ exercise_id: string; grammar_id: string; answer: string; error_options: string | null }>(
      'SELECT exercise_id, grammar_id, answer, error_options FROM grammar_exercises',
    );
    if (exerciseRows.length > 0) {
      const buckets = new Map<string, typeof exerciseRows>();
      for (const ex of exerciseRows) {
        const list = buckets.get(ex.grammar_id);
        if (list) list.push(ex);
        else buckets.set(ex.grammar_id, [ex]);
      }
      const grammarIds = [...buckets.keys()];

      const shuffleWith = <T,>(arr: T[], rand: () => number): T[] => {
        const copy = [...arr];
        for (let j = copy.length - 1; j > 0; j--) {
          const k = Math.floor(rand() * (j + 1));
          [copy[j], copy[k]] = [copy[k], copy[j]];
        }
        return copy;
      };

      let total = 0;
      let wrongTotal = 0;
      for (let i = 0; i < studentIds.length; i++) {
        const userId = studentIds[i];
        const rand = seededRandom(5000 + i * 379);
        const grammarPicked = shuffleWith(grammarIds, rand).slice(0, 4 + Math.floor(rand() * 3));
        for (const gid of grammarPicked) {
          const pool = buckets.get(gid)!;
          const take = Math.min(pool.length, 5 + Math.floor(rand() * 6));
          const chosen = shuffleWith(pool, rand).slice(0, take);
          const targetAccuracy = 0.5 + rand() * 0.45;
          for (const ex of chosen) {
            const isCorrect = rand() < targetAccuracy ? 1 : 0;
            let userAnswer = ex.answer;
            if (!isCorrect) {
              const wrongOptions = ex.error_options ? ex.error_options.split('\\|').filter(Boolean) : [];
              userAnswer = wrongOptions[0] ?? '（未作答）';
              wrongTotal++;
            }
            await db.run(
              `INSERT OR IGNORE INTO exercise_records (record_id, user_id, exercise_id, user_answer, is_correct, submitted_at)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [uuidv4(), userId, ex.exercise_id, userAnswer, isCorrect, isoAt(Math.floor(rand() * 13), 14, 20)],
            );
            total++;
          }
        }
      }
      console.log(`[seed] created ${total} exercise_records (${wrongTotal} wrong)`);
    }
  }

  const quizCount = await db.query<{ c: number }>('SELECT COUNT(*) as c FROM quiz_records');
  if ((quizCount[0]?.c ?? 0) === 0) {
    let total = 0;
    for (let i = 0; i < studentIds.length; i++) {
      const userId = studentIds[i];
      const rand = seededRandom(2000 + i * 131);
      const quizCountForUser = 2 + Math.floor(rand() * 5);
      for (let q = 0; q < quizCountForUser; q++) {
        const totalCount = 10;
        const correct = Math.max(2, Math.floor(totalCount * (0.4 + rand() * 0.55)));
        await db.run(
          `INSERT INTO quiz_records (record_id, user_id, quiz_type, score, correct_count, total_count, submitted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), userId, rand() > 0.5 ? 'vocab' : 'grammar', Math.round((correct / totalCount) * 100), correct, totalCount, isoAt(Math.floor(rand() * 13), 15, 45)],
        );
        total++;
      }
    }
    console.log(`[seed] created ${total} quiz_records`);
  }

  const hwCount = await db.query<{ c: number }>('SELECT COUNT(*) as c FROM homeworks');
  if ((hwCount[0]?.c ?? 0) === 0) {
    const teacherRow = await db.query<{ user_id: string }>(
      "SELECT user_id FROM users WHERE student_no = 'T0001'",
    );
    const teacherId = teacherRow[0]?.user_id ?? '00000000-0000-0000-0000-000000000000';
    const deadline = (days: number) => isoAt(-days, 23, 59);
    const homeworks = [
      { homeworkId: '00000000-0000-0000-0000-000000000101', quizName: 'Lektion 1 词汇测验', quizType: 'vocab', lektionRange: '[1]', deadline: deadline(2) },
      { homeworkId: '00000000-0000-0000-0000-000000000102', quizName: 'Lektion 2 语法测验', quizType: 'grammar', lektionRange: '[1,2]', deadline: deadline(4) },
    ];
    for (const hw of homeworks) {
      await db.run(
        `INSERT INTO homeworks (homework_id, quiz_name, quiz_type, lektion_range, question_count, deadline, created_by, created_at)
         VALUES (?, ?, ?, ?, 10, ?, ?, ?)`,
        [hw.homeworkId, hw.quizName, hw.quizType, hw.lektionRange, hw.deadline, teacherId, now],
      );
      for (const uid of studentIds) {
        await db.run(
          'INSERT OR IGNORE INTO homework_targets (homework_id, user_id, completed_at) VALUES (?, ?, NULL)',
          [hw.homeworkId, uid],
        );
      }
    }
    console.log(`[seed] created ${homeworks.length} homeworks`);
  }

  console.log(`[seed] student demo data ready: ${studentIds.length} students, invite code ${DEMO_INVITE_CODE}`);
}