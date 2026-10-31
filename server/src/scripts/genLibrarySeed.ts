import ExcelJS from 'exceljs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(HERE, '../../..');
const DELIVERABLE_DIR = resolve(PROJECT_ROOT, '../../给zj的交付物文件');
const MIGRATION_DIR = resolve(PROJECT_ROOT, 'data/migrations');

const CREATED_AT = '2026-01-01T00:00:00.000Z';
const WORD_PREFIX = '11111111';
const CONJ_PREFIX = '11111112';
const WEX_PREFIX = '11111113';
const GP_PREFIX = '22222222';
const GEX_PREFIX = '22222223';
const EX_PREFIX = '33333333';

function id(prefix: string, n: number): string {
  return `${prefix}-0000-0000-0000-${String(n).padStart(12, '0')}`;
}

function sql(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'NULL';
  if (typeof value === 'number') return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function cell(row: ExcelJS.Row, n: number): string {
  let v: unknown = row.getCell(n).value;
  if (v && typeof v === 'object') {
    const obj = v as { text?: string; result?: unknown };
    v = obj.text ?? obj.result ?? '';
  }
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

const DIFFICULTY_MAP: Record<string, string> = { easy: '初级', medium: '中级', hard: '高级' };

const POS_MAP: Record<string, string> = {
  'n.': '名词',
  'vt.': '动词',
  'vi.': '动词',
  'v.': '动词',
  'modal': '动词',
  'aux.': '动词',
  'adj.': '形容词',
  'adv.': '副词',
  'präp.': '介词',
  'art.': '冠词',
  'pron.': '代词',
  'konj.': '连词',
  'num.': '数词',
  'interj.': '感叹词',
  'phrase': '短语',
};

function mapPos(raw: string): string {
  const first = raw.split('/')[0]!.trim().toLowerCase();
  return POS_MAP[first] ?? '名词';
}

function mapDifficulty(raw: string): string {
  return DIFFICULTY_MAP[raw.toLowerCase().trim()] ?? '初级';
}

function normalizePlural(raw: string): string | null {
  if (!raw) return null;
  if (raw.includes('无复数') || raw === '—' || raw === '-') return null;
  return raw;
}

async function readSheet(file: string, sheetName: string): Promise<ExcelJS.Row[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(resolve(DELIVERABLE_DIR, file));
  const ws = wb.getWorksheet(sheetName);
  if (!ws) throw new Error(`未找到工作表 ${sheetName} (${file})`);
  const rows: ExcelJS.Row[] = [];
  ws.eachRow({ includeEmpty: false }, (row, i) => { if (i > 1) rows.push(row); });
  return rows;
}

async function genWords(): Promise<{ sqlLines: string[]; wordCount: number; lektionCount: Map<number, number> }> {
  const rows = await readSheet('wordlist_v1.2_你好德语A1.xlsx', '单词总表v1.2');
  const lines: string[] = [];
  const lektionCount = new Map<number, number>();

  lines.push('-- 0010_seed_wordlist.sql: 导入完整词表 wordlist_v1.2_你好德语A1（806 词）');
  lines.push('-- 说明：替换 0005 种子中的 30 词旧词库，并清理引用旧词的学习数据（由 seedStudentDemo 重建）');
  lines.push('DELETE FROM word_mastery;');
  lines.push('DELETE FROM notebooks;');
  lines.push('DELETE FROM study_records;');
  lines.push('DELETE FROM conjugations;');
  lines.push('DELETE FROM word_examples;');
  lines.push('DELETE FROM words;');

  let wordIdx = 0;
  let conjIdx = 0;
  let exIdx = 0;
  let skipped = 0;

  for (const row of rows) {
    const lemma = cell(row, 1);
    if (!lemma) { skipped++; continue; }

    const phonetic = cell(row, 2) || null;
    const pos = mapPos(cell(row, 3));
    const meaning = cell(row, 4);
    if (!meaning) { skipped++; continue; }

    const plural = normalizePlural(cell(row, 5));
    const conjText = cell(row, 6);
    const exDe = cell(row, 7);
    const exCn = cell(row, 8);
    const courseRaw = cell(row, 9);
    const difficulty = mapDifficulty(cell(row, 10));

    const firstLessonPart = courseRaw.split('/')[0]!.trim();
    const lektionMatch = firstLessonPart.match(/-(\d+)$/);
    const lektion = lektionMatch ? Number(lektionMatch[1]) : 1;

    wordIdx++;
    const wordId = id(WORD_PREFIX, wordIdx);
    lines.push(
      `INSERT INTO words (word_id, lemma, phonetic, pos, meaning, plural, course, difficulty, created_at, lektion) VALUES (${sql(wordId)}, ${sql(lemma)}, ${sql(phonetic)}, ${sql(pos)}, ${sql(meaning)}, ${sql(plural)}, ${sql('A1')}, ${sql(difficulty)}, ${sql(CREATED_AT)}, ${lektion});`,
    );
    lektionCount.set(lektion, (lektionCount.get(lektion) ?? 0) + 1);

    if (conjText) {
      const parts = conjText.split(/[;；]/).map((s) => s.trim()).filter(Boolean);
      for (const part of parts) {
        const sp = part.indexOf(' ');
        if (sp <= 0) continue;
        const person = part.slice(0, sp).trim();
        const form = part.slice(sp + 1).trim();
        if (!form) continue;
        conjIdx++;
        lines.push(
          `INSERT INTO conjugations (conjugation_id, word_id, tense, person, form) VALUES (${sql(id(CONJ_PREFIX, conjIdx))}, ${sql(wordId)}, ${sql('Präsens')}, ${sql(person)}, ${sql(form)});`,
        );
      }
    }

    if (exDe || exCn) {
      const deParts = exDe.split(/\s*\/\s*/).map((s) => s.trim()).filter(Boolean);
      const cnParts = exCn.split(/\s*\/\s*/).map((s) => s.trim()).filter(Boolean);
      if (deParts.length > 1 && deParts.length === cnParts.length) {
        for (let i = 0; i < deParts.length; i++) {
          exIdx++;
          lines.push(
            `INSERT INTO word_examples (example_id, word_id, german, translation) VALUES (${sql(id(WEX_PREFIX, exIdx))}, ${sql(wordId)}, ${sql(deParts[i]!)}, ${sql(cnParts[i]!)});`,
          );
        }
      } else {
        exIdx++;
        lines.push(
          `INSERT INTO word_examples (example_id, word_id, german, translation) VALUES (${sql(id(WEX_PREFIX, exIdx))}, ${sql(wordId)}, ${sql(exDe || null)}, ${sql(exCn || null)});`,
        );
      }
    }
  }

  return { sqlLines: lines, wordCount: wordIdx, lektionCount };
}

async function genGrammar(): Promise<{ sqlLines: string[]; gpCount: number; exCount: number }> {
  const gpRows = await readSheet('语法点清单_v1.1.xlsx', '语法点清单');
  const exRows = await readSheet('德语语法题库_v1.1.xlsx', '语法题库');

  const lines: string[] = [];
  lines.push('-- 0011_seed_grammar_library.sql: 导入语法点清单 v1.1（53 点）+ 德语语法题库 v1.1（1590 题）');
  lines.push('-- 说明：替换 0005 种子中的语法内容，练习记录由 seedStudentDemo 重建');
  lines.push('DELETE FROM exercise_records;');
  lines.push('DELETE FROM grammar_examples;');
  lines.push('DELETE FROM grammar_exercises;');
  lines.push('DELETE FROM grammar_points;');

  const gpIdMap = new Map<string, string>();
  let gpIdx = 0;
  let gexIdx = 0;
  const gpDifficulty = new Map<string, string>();

  for (const row of gpRows) {
    const externalId = cell(row, 1);
    const title = cell(row, 2);
    if (!externalId || !title) continue;
    gpIdx++;
    const grammarId = id(GP_PREFIX, gpIdx);
    gpIdMap.set(externalId, grammarId);

    const book = Number(cell(row, 3)) || 1;
    const lektion = Number(cell(row, 4)) || 1;
    const ruleText = cell(row, 5) || null;
    const exDe = cell(row, 6);
    const exCn = cell(row, 7);
    const difficulty = mapDifficulty(cell(row, 8));
    gpDifficulty.set(externalId, difficulty);

    lines.push(
      `INSERT INTO grammar_points (grammar_id, title, rule_text, difficulty, exercise_available, created_at, external_id, book, lektion) VALUES (${sql(grammarId)}, ${sql(title)}, ${sql(ruleText)}, ${sql(difficulty)}, 1, ${sql(CREATED_AT)}, ${sql(externalId)}, ${book}, ${lektion});`,
    );

    if (exDe || exCn) {
      gexIdx++;
      lines.push(
        `INSERT INTO grammar_examples (example_id, grammar_id, german, translation) VALUES (${sql(id(GEX_PREFIX, gexIdx))}, ${sql(grammarId)}, ${sql(exDe || null)}, ${sql(exCn || null)});`,
      );
    }
  }

  let exIdx = 0;
  let orphan = 0;
  const lektionCount = new Map<number, number>();
  for (const row of exRows) {
    const externalId = cell(row, 1);
    const gpExternalId = cell(row, 2);
    const type = cell(row, 3);
    const question = cell(row, 4);
    const answer = cell(row, 5);
    if (!question || !answer) continue;

    const grammarId = gpIdMap.get(gpExternalId);
    if (!grammarId) { orphan++; continue; }

    const errorWordIndex = cell(row, 6);
    const errorOptions = cell(row, 7);
    const explanation = cell(row, 8) || null;
    const source = cell(row, 9) || null;
    const difficulty = gpDifficulty.get(gpExternalId) ?? '初级';

    exIdx++;
    lines.push(
      `INSERT INTO grammar_exercises (exercise_id, grammar_id, type, question, answer, explanation, difficulty, created_at, external_id, grammar_external_id, error_word_index, error_options, source) VALUES (${sql(id(EX_PREFIX, exIdx))}, ${sql(grammarId)}, ${sql(type)}, ${sql(question)}, ${sql(answer)}, ${sql(explanation)}, ${sql(difficulty)}, ${sql(CREATED_AT)}, ${sql(externalId)}, ${sql(gpExternalId)}, ${errorWordIndex ? Number(errorWordIndex) : 'NULL'}, ${sql(errorOptions || null)}, ${sql(source)});`,
    );
  }

  if (orphan > 0) console.warn(`[warn] ${orphan} 道题目因语法点缺失被跳过`);

  return { sqlLines: lines, gpCount: gpIdx, exCount: exIdx };
}

async function main(): Promise<void> {
  mkdirSync(MIGRATION_DIR, { recursive: true });

  const words = await genWords();
  writeFileSync(resolve(MIGRATION_DIR, '0010_seed_wordlist.sql'), words.sqlLines.join('\n') + '\n', 'utf8');
  console.log(`[gen] 0010_seed_wordlist.sql — ${words.wordCount} 词`);
  const lektionDist = [...words.lektionCount.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `L${k}:${v}`).join(' ');
  console.log(`[gen] 词量按单元: ${lektionDist}`);

  const grammar = await genGrammar();
  writeFileSync(resolve(MIGRATION_DIR, '0011_seed_grammar_library.sql'), grammar.sqlLines.join('\n') + '\n', 'utf8');
  console.log(`[gen] 0011_seed_grammar_library.sql — 语法点 ${grammar.gpCount} 个 / 题目 ${grammar.exCount} 道`);
}

main().catch((err) => {
  console.error('[gen] 失败:', err);
  process.exit(1);
});