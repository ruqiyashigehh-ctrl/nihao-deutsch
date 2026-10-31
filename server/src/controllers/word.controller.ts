import type { Request, Response, NextFunction } from 'express';
import { wordService } from '../services/word.service';

export class WordController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page ?? 1);
      const pageSize = Number(req.query.pageSize ?? 50);
      const course = req.query.course as string | undefined;
      const difficulty = req.query.difficulty as string | undefined;
      const keyword = req.query.keyword as string | undefined;
      const result = await wordService.getList({ page, pageSize, course, difficulty, keyword });
      res.json(result);
    } catch (err) { next(err); }
  }

  async detail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await wordService.getDetail(req.params.wordId);
      res.json(result);
    } catch (err) { next(err); }
  }
}

export const wordController = new WordController();