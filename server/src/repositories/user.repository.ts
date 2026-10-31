import { getDatabase } from '../dal/driver';
import { toBool, fromBool, nowIso, isExpired } from '../dal/types';
import type { Role } from '@nihao-deutsch/shared';

export interface UserRow {
  user_id: string;
  student_no: string;
  name: string;
  class_id: string | null;
  role: string;
  password_hash: string;
  is_first_bind: number;
  fail_count: number;
  locked_until: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: UserRow) {
  return {
    userId: row.user_id,
    studentNo: row.student_no,
    name: row.name,
    classId: row.class_id,
    role: row.role as Role,
    passwordHash: row.password_hash,
    isFirstBind: toBool(row.is_first_bind),
    failCount: row.fail_count,
    lockedUntil: row.locked_until,
    status: row.status as 'active' | 'disabled',
    isLocked: isExpired(row.locked_until) === false && row.locked_until !== null,
  };
}

export class UserRepository {
  async findByStudentNo(studentNo: string) {
    const db = await getDatabase();
    const rows = await db.query<UserRow>(
      'SELECT * FROM users WHERE student_no = ?',
      [studentNo],
    );
    return rows.length > 0 ? mapRow(rows[0]!) : null;
  }

  async findById(userId: string) {
    const db = await getDatabase();
    const rows = await db.query<UserRow>(
      'SELECT * FROM users WHERE user_id = ?',
      [userId],
    );
    return rows.length > 0 ? mapRow(rows[0]!) : null;
  }

  async updateFailCount(userId: string, failCount: number, lockedUntil: string | null) {
    const db = await getDatabase();
    await db.run(
      'UPDATE users SET fail_count = ?, locked_until = ?, updated_at = ? WHERE user_id = ?',
      [failCount, lockedUntil, nowIso(), userId],
    );
  }

  async resetFailCount(userId: string) {
    const db = await getDatabase();
    await db.run(
      'UPDATE users SET fail_count = 0, locked_until = NULL, updated_at = ? WHERE user_id = ?',
      [nowIso(), userId],
    );
  }

  async updateBindStatus(userId: string, name: string, classId: string | null) {
    const db = await getDatabase();
    await db.run(
      'UPDATE users SET name = ?, class_id = ?, is_first_bind = ?, updated_at = ? WHERE user_id = ?',
      [name, classId, fromBool(false), nowIso(), userId],
    );
  }
}

export const userRepository = new UserRepository();