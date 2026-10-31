import { getDatabase } from '../../dal/driver';
import { runImport, uuidv4, nowIso } from '../importRunner';
import { parseXlsx } from '../parsers/xlsx.parser';
import { ExerciseImportSchema, DifficultySchema } from '@nihao-deutsch/shared';
import type { ImportReport } from '@nihao-deutsch/shared';
import { safeNumber, safeString } from './fieldMappers';

export async function handleExerciseExcel(buffer: Buffer): Promise<ImportReport> {
  const rows = await parseXlsx<any>(buffer, {
    sheetName: '语法题库',
  });

  const db = await getDatabase();

  const report = await runImport('exerciseExcel', rows, async (item: any) => {
    const externalId = safeString(item['question_id']);
    const grammarExternalId = safeString(item['grammar_point_id']);
    const type = safeString(item['type']);
    const question = safeString(item['question_text']);
    const answer = safeString(item['answer_correct']);
    const explanation = safeString(item['explanation']);
    const source = safeString(item['source']);
    const errorWordIndex = safeNumber(item['error_word_index']);
    const errorOptions = safeString(item['error_options']);

    if (!question) throw new Error('题干不能为空');
    if (!answer) throw new Error('答案不能为空');
    if (!type || (type !== 'G1' && type !== 'G2')) throw new Error(`题型必须是 G1 或 G2，实际: ${type}`);
    if (!grammarExternalId) throw new Error('grammar_point_id 不能为空');

    const grammarRows = await db.query<{ grammar_id: string }>(
      'SELECT grammar_id FROM grammar_points WHERE external_id = ?',
      [grammarExternalId],
    );
    if (grammarRows.length === 0) throw new Error(`外键关联缺失: grammar_point_id "${grammarExternalId}" 不存在`);
    const grammarId = grammarRows[0]!.grammar_id;

    const difficultyResult = await db.query<{ difficulty: string }>(
      'SELECT difficulty FROM grammar_points WHERE grammar_id = ?',
      [grammarId],
    );
    const difficulty = difficultyResult[0]?.difficulty ?? '中级';
    const diffCheck = DifficultySchema.safeParse(difficulty);
    const validDifficulty = diffCheck.success ? diffCheck.data : '中级';

    const parsed = ExerciseImportSchema.safeParse({
      grammarId,
      type: type as 'G1' | 'G2',
      question,
      answer,
      explanation,
      difficulty: validDifficulty,
      externalId,
      grammarExternalId,
      errorWordIndex,
      errorOptions,
      source,
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '校验失败');
    const d = parsed.data;

    const existing = externalId
      ? await db.query<{ exercise_id: string }>(
          'SELECT exercise_id FROM grammar_exercises WHERE external_id = ?',
          [externalId],
        )
      : [];

    const exerciseId = existing.length > 0 ? existing[0]!.exercise_id : uuidv4();

    if (existing.length > 0) {
      await db.run(
        `UPDATE grammar_exercises SET grammar_id = ?, type = ?, question = ?, answer = ?, explanation = ?, difficulty = ?, external_id = ?, grammar_external_id = ?, error_word_index = ?, error_options = ?, source = ? WHERE exercise_id = ?`,
        [d.grammarId, d.type, d.question, d.answer, d.explanation ?? null, d.difficulty, externalId ?? null, grammarExternalId ?? null, d.errorWordIndex ?? null, d.errorOptions ?? null, d.source ?? null, exerciseId],
      );
    } else {
      await db.run(
        `INSERT INTO grammar_exercises (exercise_id, grammar_id, type, question, answer, explanation, difficulty, created_at, external_id, grammar_external_id, error_word_index, error_options, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [exerciseId, d.grammarId, d.type, d.question, d.answer, d.explanation ?? null, d.difficulty, nowIso(), externalId ?? null, grammarExternalId ?? null, d.errorWordIndex ?? null, d.errorOptions ?? null, d.source ?? null],
      );
    }
  });

  return report;
}