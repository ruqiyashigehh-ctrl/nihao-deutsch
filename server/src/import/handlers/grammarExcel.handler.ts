import { getDatabase } from '../../dal/driver';
import { runImport, uuidv4, nowIso } from '../importRunner';
import { parseXlsx } from '../parsers/xlsx.parser';
import { GrammarImportSchema } from '@nihao-deutsch/shared';
import type { ImportReport } from '@nihao-deutsch/shared';
import { mapDifficulty, mapExamples, safeNumber, safeString } from './fieldMappers';

export async function handleGrammarExcel(buffer: Buffer): Promise<ImportReport> {
  const rows = await parseXlsx<any>(buffer, {
    sheetName: '语法点清单',
    skipSheets: ['修改记录'],
  });

  const db = await getDatabase();

  const report = await runImport('grammarExcel', rows, async (item: any) => {
    const title = safeString(item['name']);
    if (!title) throw new Error('语法点名称不能为空');

    const difficulty = mapDifficulty(safeString(item['difficulty']));
    const examples = mapExamples(safeString(item['example_de']), safeString(item['example_cn']));
    const externalId = safeString(item['grammar_point_id']);
    const book = safeNumber(item['book']);
    const lektion = safeNumber(item['lektion']);
    const ruleText = safeString(item['rule_text']);

    const parsed = GrammarImportSchema.safeParse({
      title,
      ruleText,
      difficulty,
      examples,
      externalId,
      book,
      lektion,
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '校验失败');
    const d = parsed.data;

    const existing = externalId
      ? await db.query<{ grammar_id: string }>(
          'SELECT grammar_id FROM grammar_points WHERE external_id = ?',
          [externalId],
        )
      : [];

    const grammarId = existing.length > 0 ? existing[0]!.grammar_id : uuidv4();

    if (existing.length > 0) {
      await db.run(
        `UPDATE grammar_points SET title = ?, rule_text = ?, difficulty = ?, external_id = ?, book = ?, lektion = ? WHERE grammar_id = ?`,
        [d.title, d.ruleText ?? null, d.difficulty, externalId ?? null, d.book ?? null, d.lektion ?? null, grammarId],
      );
      await db.run('DELETE FROM grammar_examples WHERE grammar_id = ?', [grammarId]);
    } else {
      await db.run(
        `INSERT INTO grammar_points (grammar_id, title, rule_text, difficulty, exercise_available, created_at, external_id, book, lektion) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)`,
        [grammarId, d.title, d.ruleText ?? null, d.difficulty, nowIso(), externalId ?? null, d.book ?? null, d.lektion ?? null],
      );
    }

    for (const e of d.examples ?? []) {
      await db.run(
        'INSERT INTO grammar_examples (example_id, grammar_id, german, translation) VALUES (?, ?, ?, ?)',
        [uuidv4(), grammarId, e.german, e.translation],
      );
    }
  });

  return report;
}