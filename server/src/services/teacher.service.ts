import { teacherRepository } from '../repositories/teacher.repository';
import { studentRepository } from '../repositories/student.repository';
import { profileService } from './profile.service';

import { AppError } from '../middleware/errorHandler';
import { toBool, nowIso } from '../dal/types';
import { v4 as uuidv4 } from 'uuid';

const KNOWLEDGE_POINTS = ['meaning', 'pos', 'conjugation'] as const;

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export class TeacherService {
  async getTeacherClasses(teacherId: string) {
    return teacherRepository.findTeacherClasses(teacherId);
  }

  async getStudents(teacherId: string) {
    const rows = await teacherRepository.findStudentsByTeacher(teacherId);
    return rows.map((r) => ({
      userId: r.user_id,
      studentNo: r.student_no,
      name: r.name,
      classId: r.class_id,
      className: r.class_name,
      status: r.status as 'active' | 'disabled',
      checkinCount: r.checkin_count,
      exerciseCount: r.exercise_count,
      correctCount: r.correct_count,
      accuracy: r.exercise_count > 0 ? Math.round((r.correct_count / r.exercise_count) * 100) : 0,
    }));
  }

  async getStudentCheckinRecords(teacherId: string, studentId: string) {
    await this.assertTeacherOfStudent(teacherId, studentId);
    const rows = await teacherRepository.findStudentCheckinRecords(studentId);
    return rows.map((r: any) => ({
      recordId: r.record_id,
      checkpointId: r.checkpoint_id,
      checkpointName: r.checkpoint_name,
      windowId: r.window_id,
      latitude: r.latitude,
      longitude: r.longitude,
      scannedValue: r.scanned_value,
      checkedAt: r.checked_at,
    }));
  }

  async getStudentExerciseRecords(teacherId: string, studentId: string) {
    await this.assertTeacherOfStudent(teacherId, studentId);
    const rows = await teacherRepository.findStudentExerciseRecords(studentId);
    return rows.map((r: any) => ({
      recordId: r.record_id,
      exerciseId: r.exercise_id,
      grammarId: r.grammar_id,
      grammarTitle: r.grammar_title,
      type: r.type,
      question: r.question,
      answer: r.answer,
      userAnswer: r.user_answer,
      isCorrect: toBool(r.is_correct),
      submittedAt: r.submitted_at,
    }));
  }

  async getStudentDetail(teacherId: string, studentId: string) {
    await this.assertTeacherOfStudent(teacherId, studentId);
    const detail = await teacherRepository.findStudentDetail(studentId);
    if (!detail) throw new AppError(404, '学生不存在', 'STUDENT_NOT_FOUND');
    return {
      userId: detail.user_id,
      studentNo: detail.student_no,
      name: detail.name,
      classId: detail.class_id,
      className: detail.class_name,
      status: detail.status as 'active' | 'disabled',
      createdAt: detail.created_at,
    };
  }

  async getInviteCodes(teacherId: string) {
    const classes = await teacherRepository.findTeacherClasses(teacherId);
    const result: { classId: string; className: string; inviteCode: string }[] = [];
    for (const c of classes) {
      const code = await studentRepository.findInviteCode(c.class_id);
      if (code) {
        result.push({ classId: c.class_id, className: c.class_name, inviteCode: code });
      } else {
        const newCode = randomCode();
        await teacherRepository.upsertInviteCode(c.class_id, newCode, nowIso());
        result.push({ classId: c.class_id, className: c.class_name, inviteCode: newCode });
      }
    }
    return result;
  }

  async publishHomework(teacherId: string, payload: {
    classIds: string[]; lektionRange: number[]; quizType: 'vocab' | 'grammar';
    questionCount: number; deadline: string;
  }) {
    const teacherClasses = await teacherRepository.findTeacherClasses(teacherId);
    const teacherClassIds = new Set(teacherClasses.map((c) => c.class_id));
    const validClassIds = payload.classIds.filter((id) => teacherClassIds.has(id));
    if (validClassIds.length === 0) throw new AppError(403, '无权向所选班级发布作业', 'FORBIDDEN');

    const targetUserIds: string[] = [];
    for (const classId of validClassIds) {
      const students = await teacherRepository.findClassStudents(classId);
      targetUserIds.push(...students.map((s) => s.user_id));
    }
    if (targetUserIds.length === 0) throw new AppError(422, '所选班级没有学生', 'NO_TARGETS');

    const rangeLabel = payload.lektionRange.length > 0
      ? `Lektion ${Math.min(...payload.lektionRange)}-${Math.max(...payload.lektionRange)}`
      : 'Lektion 1';
    const quizName = `${rangeLabel} ${payload.quizType === 'vocab' ? '词汇' : '语法'}测验`;

    const homeworkId = uuidv4();
    await teacherRepository.insertHomework({
      homeworkId,
      quizName,
      quizType: payload.quizType,
      lektionRange: JSON.stringify(payload.lektionRange),
      questionCount: payload.questionCount,
      deadline: payload.deadline,
      createdBy: teacherId,
      createdAt: nowIso(),
    });
    await teacherRepository.insertHomeworkTargets(homeworkId, targetUserIds);

    return { homeworkId, targetUserIds };
  }

  async getAccuracy(teacherId: string, classId: string) {
    await this.assertTeacherOfClass(teacherId, classId);
    const rows = await teacherRepository.findAccuracyByLektion(classId);
    const accMap = new Map<number, number>();
    for (const r of rows) {
      accMap.set(r.lektion, r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0);
    }
    const lektions = [...new Set([...accMap.keys(), 1, 2])].sort((a, b) => a - b);
    const cells: { lektion: number; knowledge: string; accuracy: number }[] = [];
    for (const l of lektions) {
      const acc = accMap.get(l) ?? 0;
      for (const k of KNOWLEDGE_POINTS) {
        cells.push({ lektion: l, knowledge: k, accuracy: acc });
      }
    }
    return cells;
  }

  async getAttendance(teacherId: string, classId: string) {
    await this.assertTeacherOfClass(teacherId, classId);
    const days = 6;
    const dates: string[] = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const [students, checkDates, overrides] = await Promise.all([
      teacherRepository.findClassStudents(classId),
      teacherRepository.findAttendanceDates(classId, days),
      teacherRepository.findAttendanceOverrides(classId, days),
    ]);

    const checkedSet = new Set<string>();
    for (const cd of checkDates) checkedSet.add(`${cd.user_id}|${cd.d}`);
    const overrideMap = new Map<string, boolean>();
    for (const o of overrides) overrideMap.set(`${o.user_id}|${o.date}`, toBool(o.checked));

    const rows = students.map((s) => ({
      studentId: s.user_id,
      studentName: s.name,
      cells: dates.map((date) => {
        const key = `${s.user_id}|${date}`;
        const override = overrideMap.get(key);
        if (override !== undefined) return override;
        return checkedSet.has(key);
      }),
    }));

    return { dates, rows };
  }

  async patchAttendance(teacherId: string, studentId: string, date: string, checked: boolean) {
    await this.assertTeacherOfStudent(teacherId, studentId);
    await teacherRepository.upsertAttendanceOverride(studentId, date, checked ? 1 : 0);
  }

  async getGrammarAnalytics(teacherId: string, classId: string) {
    await this.assertTeacherOfClass(teacherId, classId);
    const [stats, byLektionRows, overall, students] = await Promise.all([
      teacherRepository.findClassGrammarStats(classId),
      teacherRepository.findClassGrammarByLektion(classId),
      teacherRepository.findClassGrammarOverall(classId),
      teacherRepository.findClassStudents(classId),
    ]);

    const pct = (correct: number, total: number) => (total > 0 ? Math.round((correct / total) * 100) : 0);

    const byLektion = byLektionRows.map((r) => ({
      lektion: r.lektion,
      accuracy: pct(r.correct, r.total),
      answers: r.total,
      participants: r.participants,
    }));

    const allWeakPoints = stats.map((r) => ({
      grammarId: r.grammar_id,
      title: r.title,
      lektion: r.lektion ?? null,
      accuracy: pct(r.correct, r.total),
      wrong: r.total - r.correct,
      total: r.total,
      participants: r.participants,
    }));
    const belowThreshold = allWeakPoints.filter((g) => g.accuracy < 70).slice(0, 5);
    const weakGrammars = belowThreshold.length > 0 ? belowThreshold : allWeakPoints.slice(0, 3);

    return {
      overall: {
        accuracy: pct(overall.correct, overall.total),
        participants: overall.participants,
        totalAnswers: overall.total,
        studentCount: students.length,
      },
      byLektion,
      weakGrammars,
    };
  }

  async getStudentReport(teacherId: string, studentId: string) {
    await this.assertTeacherOfStudent(teacherId, studentId);
    return profileService.getReportDetail(studentId);
  }

  private async assertTeacherOfClass(teacherId: string, classId: string): Promise<void> {
    const ok = await teacherRepository.isTeacherOfClass(teacherId, classId);
    if (!ok) throw new AppError(403, '非所辖班级，无权访问', 'FORBIDDEN');
  }

  private async assertTeacherOfStudent(teacherId: string, studentId: string): Promise<void> {
    const detail = await teacherRepository.findStudentDetail(studentId);
    if (!detail) throw new AppError(404, '学生不存在', 'STUDENT_NOT_FOUND');
    if (!detail.class_id) throw new AppError(403, '该学生未分配班级，无权访问', 'FORBIDDEN');
    const ok = await teacherRepository.isTeacherOfClass(teacherId, detail.class_id);
    if (!ok) throw new AppError(403, '非所辖班级学生，无权访问', 'FORBIDDEN');
  }
}

export const teacherService = new TeacherService();