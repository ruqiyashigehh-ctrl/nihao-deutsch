import type { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../dal/driver';
import { runImport, uuidv4, nowIso, fromBool } from '../import/importRunner';
import { parseCsv } from '../import/parsers/csv.parser';
import { parseXlsx } from '../import/parsers/xlsx.parser';
import { orchestrateKnowledgeBase } from '../import/knowledgeBaseOrchestrator';
import { WordImportSchema, GrammarImportSchema, ExerciseImportSchema, CheckpointImportSchema, RosterImportSchema, CopywritingImportSchema, WindowImportSchema } from '@nihao-deutsch/shared';
import bcrypt from 'bcryptjs';
import type { ImportType, ImportReport } from '@nihao-deutsch/shared';

export class ImportController {
  async import(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = req.params.type as ImportType;
      const file = req.file;
      if (!file) return next(new Error('未上传文件'));

      const isXlsx = file.originalname.endsWith('.xlsx') || file.mimetype.includes('spreadsheetml');
      const items = isXlsx
        ? await parseXlsx(file.buffer)
        : parseCsv(file.buffer.toString('utf-8'));
      const db = await getDatabase();

      let report: ImportReport;

      switch (type) {
        case 'words':
          report = await runImport(type, items, async (item: any) => {
            const parsed = WordImportSchema.safeParse(item);
            if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '校验失败');
            const d = parsed.data;
            const wordId = uuidv4();
            await db.run(
              'INSERT INTO words (word_id, lemma, phonetic, pos, meaning, plural, course, difficulty, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [wordId, d.lemma, d.phonetic ?? null, d.pos, d.meaning, d.plural ?? null, d.course, d.difficulty, nowIso()],
            );
            for (const c of d.conjugations ?? []) {
              await db.run('INSERT INTO conjugations (conjugation_id, word_id, tense, person, form) VALUES (?, ?, ?, ?, ?)', [uuidv4(), wordId, c.tense, c.person, c.form]);
            }
            for (const e of d.examples ?? []) {
              await db.run('INSERT INTO word_examples (example_id, word_id, german, translation) VALUES (?, ?, ?, ?)', [uuidv4(), wordId, e.german, e.translation]);
            }
          });
          break;

        case 'grammar':
          report = await runImport(type, items, async (item: any) => {
            const parsed = GrammarImportSchema.safeParse(item);
            if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '校验失败');
            const d = parsed.data;
            const grammarId = uuidv4();
            await db.run(
              'INSERT INTO grammar_points (grammar_id, title, rule_text, difficulty, exercise_available, created_at) VALUES (?, ?, ?, ?, 0, ?)',
              [grammarId, d.title, d.ruleText ?? null, d.difficulty, nowIso()],
            );
            for (const e of d.examples ?? []) {
              await db.run('INSERT INTO grammar_examples (example_id, grammar_id, german, translation) VALUES (?, ?, ?, ?)', [uuidv4(), grammarId, e.german, e.translation]);
            }
          });
          break;

        case 'exercises':
          report = await runImport(type, items, async (item: any) => {
            const parsed = ExerciseImportSchema.safeParse(item);
            if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '校验失败');
            const d = parsed.data;
            await db.run(
              'INSERT INTO grammar_exercises (exercise_id, grammar_id, type, question, answer, explanation, difficulty, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [uuidv4(), d.grammarId, d.type, d.question, d.answer, d.explanation ?? null, d.difficulty, nowIso()],
            );
          });
          break;

        case 'checkpoints':
          report = await runImport(type, items, async (item: any) => {
            const parsed = CheckpointImportSchema.safeParse(item);
            if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '校验失败');
            const d = parsed.data;
            await db.run(
              'INSERT INTO checkpoints (checkpoint_id, name, latitude, longitude, radius, require_scan, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [uuidv4(), d.name, d.latitude, d.longitude, d.radius, fromBool(d.requireScan), nowIso()],
            );
          });
          break;

        case 'roster':
          report = await runImport(type, items, async (item: any) => {
            const parsed = RosterImportSchema.safeParse(item);
            if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '校验失败');
            const d = parsed.data;
            const hash = await bcrypt.hash(d.password ?? 'demo123456', 10);
            await db.run(
              'INSERT INTO users (user_id, student_no, name, class_id, role, password_hash, is_first_bind, fail_count, status, created_at, updated_at) VALUES (?, ?, ?, NULL, ?, ?, 1, 0, ?, ?, ?)',
              [uuidv4(), d.studentNo, d.name, d.role, hash, 'active', nowIso(), nowIso()],
            );
          });
          break;

        case 'copywriting':
          report = await runImport(type, items, async (item: any) => {
            const parsed = CopywritingImportSchema.safeParse(item);
            if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '校验失败');
            const d = parsed.data;
            await db.run('INSERT OR REPLACE INTO copywriting (key, value) VALUES (?, ?)', [d.key, d.value]);
          });
          break;

        case 'windows':
          report = await runImport(type, items, async (item: any) => {
            const parsed = WindowImportSchema.safeParse(item);
            if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '校验失败');
            const d = parsed.data;
            await db.run(
              'INSERT INTO check_windows (window_id, checkpoint_id, start_time, end_time, weekdays) VALUES (?, ?, ?, ?, ?)',
              [uuidv4(), d.checkpointId, d.startTime, d.endTime, JSON.stringify(d.weekdays)],
            );
          });
          break;

        default:
          return next(new Error(`未知导入类型: ${type}`));
      }

      res.json(report);
    } catch (err) { next(err); }
  }

  async importKnowledgeBase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      if (!files) return next(new Error('未上传文件'));

      const getFile = (name: string): Buffer | undefined => {
        const f = files[name]?.[0];
        return f ? f.buffer : undefined;
      };

      const report = await orchestrateKnowledgeBase({
        grammar: getFile('grammar'),
        exercises: getFile('exercises'),
        checkpoints: getFile('checkpoints'),
        windows: getFile('windows'),
        copywriting: getFile('copywriting'),
      });

      res.json(report);
    } catch (err) { next(err); }
  }
}
export const importController = new ImportController();