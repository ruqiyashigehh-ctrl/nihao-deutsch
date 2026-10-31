import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../dal/driver';
import { nowIso } from '../dal/types';

const DEMO_CLASS_ID = '00000000-0000-0000-0000-000000000010';

const DEMO_USERS = [
  { studentNo: '20240001', name: '演示学生', role: 'student' as const, password: 'demo123456' },
  { studentNo: 'T0001', name: '演示教师', role: 'teacher' as const, password: 'demo123456' },
  { studentNo: 'admin', name: '管理员', role: 'admin' as const, password: 'admin123456' },
];

export async function seedDemoUsers(): Promise<void> {
  const db = await getDatabase();
  const now = nowIso();

  for (const user of DEMO_USERS) {
    const existing = await db.query<{ user_id: string }>(
      'SELECT user_id FROM users WHERE student_no = ?',
      [user.studentNo],
    );
    if (existing.length > 0) {
      console.log(`[seed] ${user.studentNo} already exists, skip`);
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 10);
    const userId = uuidv4();
    const classId = user.role === 'student' ? DEMO_CLASS_ID : null;

    await db.run(
      `INSERT INTO users (user_id, student_no, name, class_id, role, password_hash, is_first_bind, fail_count, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0, 'active', ?, ?)`,
      [userId, user.studentNo, user.name, classId, user.role, passwordHash, now, now],
    );

    if (user.role === 'teacher') {
      await db.run(
        'INSERT OR IGNORE INTO teacher_classes (teacher_id, class_id) VALUES (?, ?)',
        [userId, DEMO_CLASS_ID],
      );
    }

    console.log(`[seed] ${user.studentNo} (${user.role}) created, password: ${user.password}`);
  }
}