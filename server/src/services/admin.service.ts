import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { adminRepository } from '../repositories/admin.repository';
import { AppError } from '../middleware/errorHandler';
import { toBool, nowIso } from '../dal/types';

const DEFAULT_PASSWORD = 'demo123456';

export class AdminService {
  async getCheckpoints() {
    const rows = await adminRepository.findCheckpoints();
    return rows.map((r: Record<string, unknown>) => ({
      checkpointId: r.checkpoint_id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      radius: r.radius,
      status: toBool(r.is_active) ? 'enabled' : 'disabled',
    }));
  }

  async createCheckpoint(input: { name: string; latitude: number; longitude: number; radius: number; status?: string }) {
    if (input.longitude < -180 || input.longitude > 180 || input.latitude < -90 || input.latitude > 90) {
      throw new AppError(422, '经纬度格式不合法', 'INVALID_COORDS');
    }
    const existing = await adminRepository.findCheckpointByName(input.name);
    if (existing) throw new AppError(409, '打卡点名称已存在', 'DUPLICATE_NAME');

    const checkpointId = uuidv4();
    const isActive = input.status === 'disabled' ? 0 : 1;
    await adminRepository.insertCheckpoint({
      checkpointId, name: input.name, latitude: input.latitude,
      longitude: input.longitude, radius: input.radius, isActive, createdAt: nowIso(),
    });
    return {
      checkpointId, name: input.name, latitude: input.latitude,
      longitude: input.longitude, radius: input.radius,
      status: input.status === 'disabled' ? 'disabled' : 'enabled',
    };
  }

  async toggleCheckpoint(checkpointId: string, status: string) {
    const isActive = status === 'enabled' ? 1 : 0;
    await adminRepository.updateCheckpointStatus(checkpointId, isActive);
  }

  async getClassesWithTeacher() {
    const rows = await adminRepository.findClassesWithTeacher();
    return rows.map((r: Record<string, unknown>) => ({
      classId: r.class_id,
      className: r.class_name,
      inviteCode: r.invite_code ?? '',
      teacherId: r.teacher_id ?? null,
      teacherName: r.teacher_name ?? null,
    }));
  }

  async bindTeacher(classId: string, teacherId: string) {
    const teachers = await adminRepository.findTeachers();
    if (!teachers.some((t: { user_id: string }) => t.user_id === teacherId)) {
      throw new AppError(404, '教师不存在', 'TEACHER_NOT_FOUND');
    }
    await adminRepository.bindTeacher(classId, teacherId);
  }

  async getStudentsWithClass() {
    const rows = await adminRepository.findStudentsWithClass();
    return rows.map((r: Record<string, unknown>) => ({
      userId: r.user_id,
      studentNo: r.student_no,
      name: r.name,
      classId: r.class_id,
      className: r.class_name,
    }));
  }

  async resetPassword(userId: string) {
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    await adminRepository.updateUserPassword(userId, passwordHash, nowIso());
    return { password: DEFAULT_PASSWORD };
  }

  async getWordsByLektion(lektion: number) {
    const rows = await adminRepository.findWordsByLektion(lektion);
    return rows.map((w: Record<string, unknown>) => ({
      wordId: w.word_id,
      lemma: w.lemma,
      phonetic: w.phonetic,
      pos: w.pos,
      meaning: w.meaning,
      plural: w.plural,
      course: w.course,
      difficulty: w.difficulty,
    }));
  }

  async getStats() {
    return adminRepository.findDashboardStats();
  }

  async getTrend() {
    const rows = await adminRepository.findCheckinTrend(6);
    const countMap = new Map<string, number>();
    for (const r of rows) countMap.set(r.d, r.c);

    const dates: string[] = [];
    const counts: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
      counts.push(countMap.get(d.toISOString().slice(0, 10)) ?? 0);
    }
    return { dates, counts };
  }

  async saveGrammarPoint(input: {
    title: string; ruleText: string;
    exercises: { type: 'G1' | 'G2'; question: string; answer: string; explanation?: string }[];
  }) {
    if (!input.title.trim()) throw new AppError(422, '语法点标题不能为空', 'INVALID_BODY');
    if (input.exercises.length === 0) throw new AppError(422, '至少录入一道练习题', 'INVALID_BODY');

    const grammarId = uuidv4();
    const now = nowIso();
    await adminRepository.insertGrammarPoint({
      grammarId,
      title: input.title,
      ruleText: input.ruleText,
      difficulty: '初级',
      exerciseAvailable: 1,
      createdAt: now,
    });
    for (const ex of input.exercises) {
      await adminRepository.insertGrammarExercise({
        exerciseId: uuidv4(),
        grammarId,
        type: ex.type,
        question: ex.question,
        answer: ex.answer,
        explanation: ex.explanation ?? null,
        difficulty: '初级',
        createdAt: now,
      });
    }
    return { grammarId, exerciseCount: input.exercises.length };
  }
}

export const adminService = new AdminService();