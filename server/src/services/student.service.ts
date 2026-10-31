import { v4 as uuidv4 } from 'uuid';
import { studentRepository } from '../repositories/student.repository';
import { getDatabase } from '../dal/driver';
import { AppError } from '../middleware/errorHandler';
import { nowIso } from '../dal/types';

export class StudentService {
  async getNotebookIds(userId: string) {
    return studentRepository.findNotebookIds(userId);
  }

  async toggleNotebook(userId: string, wordId: string) {
    const existing = await studentRepository.findNotebook(userId, wordId);
    if (existing) {
      await studentRepository.deleteNotebook(userId, wordId);
      return { added: false };
    }
    await studentRepository.insertNotebook(userId, wordId, nowIso());
    return { added: true };
  }

  async getMastery(userId: string, lektion: number) {
    const { total, mastered } = await studentRepository.countMastery(userId, lektion);
    return { lektion, total, mastered };
  }

  async getRank(userId: string, type: 'reading' | 'vocab') {
    const user = await studentRepository.findUser(userId);
    if (!user) throw new AppError(404, '用户不存在', 'NOT_FOUND');
    if (!user.class_id) {
      return { list: [], myRank: { rank: 'unranked' as const, name: user.name, value: 0 } };
    }

    const rows = await studentRepository.findRankRows(user.class_id);
    const valueOf = (r: { vocab_count: number; reading_count: number }) =>
      type === 'vocab' ? r.vocab_count : r.reading_count;

    const sorted = rows
      .map((r) => ({ userId: r.user_id, name: r.name, value: valueOf(r) }))
      .sort((a, b) => b.value - a.value);

    const list = sorted.map((s, idx) => ({
      rank: idx + 1,
      studentId: s.userId,
      name: s.name,
      value: s.value,
      isMe: s.userId === userId,
    }));

    const myIdx = sorted.findIndex((s) => s.userId === userId);
    const me = sorted[myIdx];
    const myRank = me
      ? { rank: myIdx + 1, name: me.name, value: me.value }
      : { rank: 'unranked' as const, name: user.name, value: 0 };

    return { list, myRank };
  }

  async getClassmates(userId: string) {
    const user = await studentRepository.findUser(userId);
    if (!user) throw new AppError(404, '用户不存在', 'NOT_FOUND');
    if (!user.class_id) return [];
    const rows = await studentRepository.findClassmates(user.class_id, userId);
    return rows.map((r) => ({
      studentId: r.user_id,
      name: r.name,
      studentNo: r.student_no,
    }));
  }

  async pairByCode(userId: string, code: string) {
    const user = await studentRepository.findUser(userId);
    if (!user) throw new AppError(404, '用户不存在', 'NOT_FOUND');
    if (!user.class_id) throw new AppError(422, '您尚未加入班级', 'NO_CLASS');

    const classCode = await studentRepository.findInviteCode(user.class_id);
    if (!classCode || classCode.toUpperCase() !== code.toUpperCase()) {
      throw new AppError(422, '邀请码无效或非同班同学', 'INVALID_CODE');
    }
    return { paired: true };
  }

  async pairByClassmate(userId: string, classmateId: string) {
    const user = await studentRepository.findUser(userId);
    if (!user) throw new AppError(404, '用户不存在', 'NOT_FOUND');
    if (!user.class_id) throw new AppError(422, '您尚未加入班级', 'NO_CLASS');

    const classmates = await studentRepository.findClassmates(user.class_id, userId);
    const mate = classmates.find((c) => c.user_id === classmateId);
    if (!mate) throw new AppError(422, '邀请码无效或非同班同学', 'NOT_CLASSMATE');

    const existing = await studentRepository.findPairing(userId, classmateId);
    if (!existing) {
      await studentRepository.insertPairing(userId, classmateId, user.class_id, nowIso());
    }
    return { paired: true, pairName: mate.name };
  }

  async getPendingHomework(userId: string) {
    const rows = await studentRepository.findPendingHomework(userId);
    return rows.map((r) => ({
      homeworkId: r.homework_id,
      quizName: r.quiz_name,
      deadline: r.deadline,
      status: 'pending' as const,
    }));
  }

  async getTodayWords(userId: string) {
    const rows = await studentRepository.findStudyWords(userId, 15);
    return rows.map((r) => ({
      wordId: r.word_id,
      word: r.lemma,
      phonetic: r.phonetic,
      pos: r.pos,
      definition: r.meaning,
      example: r.example ?? undefined,
    }));
  }

  async recordStudyResult(userId: string, wordIds: string[], status: 'known' | 'unknown') {
    const db = await getDatabase();
    const now = nowIso();
    for (const wordId of wordIds) {
      const mastered = status === 'known' ? 1 : 0;
      await db.run(
        `INSERT INTO word_mastery (user_id, word_id, mastered, updated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT (user_id, word_id) DO UPDATE SET mastered = MAX(mastered, excluded.mastered), updated_at = excluded.updated_at`,
        [userId, wordId, mastered, now],
      );
      await db.run(
        'INSERT INTO study_records (record_id, user_id, word_id, status, studied_at) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), userId, wordId, status, now],
      );
    }
    return { recorded: wordIds.length };
  }
}

export const studentService = new StudentService();