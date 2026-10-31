import type { Request, Response, NextFunction } from 'express';
import { studentService } from '../services/student.service';
import { quizService } from '../services/quiz.service';
import { AppError } from '../middleware/errorHandler';

export class StudentController {
  async getTodayWords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await studentService.getTodayWords(req.user.userId));
    } catch (err) { next(err); }
  }

  async recordStudy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      const { results } = req.body as { results?: Record<string, string> };
      if (!results || typeof results !== 'object') {
        throw new AppError(422, '背词结果不能为空', 'INVALID_BODY');
      }
      const known = Object.entries(results)
        .filter(([, status]) => status === 'known')
        .map(([wordId]) => wordId);
      const unknown = Object.entries(results)
        .filter(([, status]) => status === 'unknown')
        .map(([wordId]) => wordId);
      if (known.length > 0) await studentService.recordStudyResult(req.user.userId, known, 'known');
      if (unknown.length > 0) await studentService.recordStudyResult(req.user.userId, unknown, 'unknown');
      res.json({ recorded: known.length + unknown.length });
    } catch (err) { next(err); }
  }

  async getQuizQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      const type = (req.query.type === 'grammar' ? 'grammar' : 'vocab') as 'vocab' | 'grammar';
      const count = Math.min(30, Math.max(1, Number(req.query.count) || 10));
      const lektionRange = this.parseLektionRange(req.query.lektionRange);
      res.json(await quizService.getQuestions(type, count, lektionRange));
    } catch (err) { next(err); }
  }

  private parseLektionRange(raw: unknown): number[] | undefined {
    if (typeof raw !== 'string' || !raw.trim()) return undefined;
    const parts = raw
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 12);
    const uniq = [...new Set(parts)].sort((a, b) => a - b);
    return uniq.length > 0 ? uniq : undefined;
  }

  async recordQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      const { type, score, correctCount, totalCount, details } = req.body as {
        type?: string; score?: number; correctCount?: number; totalCount?: number;
        details?: {
          questionId: string; question: string; questionKind: 'choice' | 'fill';
          userAnswer: string; correctAnswer: string; isCorrect: boolean;
          lektion?: number | null; grammarId?: string | null;
        }[];
      };
      if (typeof score !== 'number' || typeof correctCount !== 'number' || typeof totalCount !== 'number') {
        throw new AppError(422, '刷题结果参数不完整', 'INVALID_BODY');
      }
      const quizType = type === 'grammar' ? 'grammar' : 'vocab';
      await quizService.recordQuizResult(req.user.userId, quizType, score, correctCount, totalCount, details);
      res.json({ recorded: true });
    } catch (err) { next(err); }
  }

  async getNotebookIds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await studentService.getNotebookIds(req.user.userId));
    } catch (err) { next(err); }
  }

  async toggleNotebook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      const { wordId } = req.body as { wordId?: string };
      if (!wordId) throw new AppError(422, '单词ID不能为空', 'INVALID_BODY');
      res.json(await studentService.toggleNotebook(req.user.userId, wordId));
    } catch (err) { next(err); }
  }

  async getMastery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      const lektion = Math.min(12, Math.max(1, Number(req.query.lektion) || 1));
      res.json(await studentService.getMastery(req.user.userId, lektion));
    } catch (err) { next(err); }
  }

  async getRank(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      const type = req.query.type === 'vocab' ? 'vocab' : 'reading';
      res.json(await studentService.getRank(req.user.userId, type));
    } catch (err) { next(err); }
  }

  async getClassmates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await studentService.getClassmates(req.user.userId));
    } catch (err) { next(err); }
  }

  async pairByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      const { code } = req.body as { code?: string };
      if (!code) throw new AppError(422, '邀请码不能为空', 'INVALID_BODY');
      res.json(await studentService.pairByCode(req.user.userId, code));
    } catch (err) { next(err); }
  }

  async pairByClassmate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      const { classmateId } = req.body as { classmateId?: string };
      if (!classmateId) throw new AppError(422, '同学ID不能为空', 'INVALID_BODY');
      res.json(await studentService.pairByClassmate(req.user.userId, classmateId));
    } catch (err) { next(err); }
  }

  async getPendingHomework(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, '未认证', 'NO_AUTH');
      res.json(await studentService.getPendingHomework(req.user.userId));
    } catch (err) { next(err); }
  }
}

export const studentController = new StudentController();