import type { Request, Response, NextFunction } from 'express';
import { grammarService } from '../services/grammar.service';

export class GrammarController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await grammarService.getList(req.query.difficulty as string | undefined)); } catch (err) { next(err); }
  }
  async detail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await grammarService.getDetail(req.params.grammarId)); } catch (err) { next(err); }
  }
}
export const grammarController = new GrammarController();