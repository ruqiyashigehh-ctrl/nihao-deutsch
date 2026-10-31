import type { Request, Response, NextFunction } from 'express';
import { teacherService } from '../services/teacher.service';
import { AppError } from '../middleware/errorHandler';

export class TeacherController {
  async listClasses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await teacherService.getTeacherClasses(req.user.userId));
    } catch (err) { next(err); }
  }

  async listStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await teacherService.getStudents(req.user.userId));
    } catch (err) { next(err); }
  }

  async getStudentDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await teacherService.getStudentDetail(req.user.userId, req.params.userId));
    } catch (err) { next(err); }
  }

  async getStudentCheckinRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await teacherService.getStudentCheckinRecords(req.user.userId, req.params.userId));
    } catch (err) { next(err); }
  }

  async getStudentExerciseRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await teacherService.getStudentExerciseRecords(req.user.userId, req.params.userId));
    } catch (err) { next(err); }
  }

  async getStudentReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await teacherService.getStudentReport(req.user.userId, req.params.userId));
    } catch (err) { next(err); }
  }

  async getGrammarAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      const classId = String(req.query.classId ?? '');
      if (!classId) throw new AppError(422, '班级ID不能为空', 'INVALID_QUERY');
      res.json(await teacherService.getGrammarAnalytics(req.user.userId, classId));
    } catch (err) { next(err); }
  }

  async getInviteCodes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await teacherService.getInviteCodes(req.user.userId));
    } catch (err) { next(err); }
  }

  async publishHomework(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await teacherService.publishHomework(req.user.userId, req.body));
    } catch (err) { next(err); }
  }

  async getAccuracy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      const classId = String(req.query.classId ?? '');
      if (!classId) throw new AppError(422, '班级ID不能为空', 'INVALID_QUERY');
      res.json(await teacherService.getAccuracy(req.user.userId, classId));
    } catch (err) { next(err); }
  }

  async getAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      const classId = String(req.query.classId ?? '');
      if (!classId) throw new AppError(422, '班级ID不能为空', 'INVALID_QUERY');
      res.json(await teacherService.getAttendance(req.user.userId, classId));
    } catch (err) { next(err); }
  }

  async patchAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      const { studentId, date, checked } = req.body as { studentId?: string; date?: string; checked?: boolean };
      if (!studentId || !date || typeof checked !== 'boolean') {
        throw new AppError(422, '出勤修正参数不完整', 'INVALID_BODY');
      }
      await teacherService.patchAttendance(req.user.userId, studentId, date, checked);
      res.json({ updated: true });
    } catch (err) { next(err); }
  }
}

export const teacherController = new TeacherController();