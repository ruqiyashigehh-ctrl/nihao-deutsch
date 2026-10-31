import { getDatabase } from '../../dal/driver';
import { runImport } from '../importRunner';
import { parseXlsx } from '../parsers/xlsx.parser';
import { CopywritingImportSchema } from '@nihao-deutsch/shared';
import type { ImportReport } from '@nihao-deutsch/shared';
import { safeString } from './fieldMappers';

export async function handleCopywritingExcel(buffer: Buffer): Promise<ImportReport> {
  const rows = await parseXlsx<any>(buffer, {
    sheetName: '文案清单',
  });

  const db = await getDatabase();

  const report = await runImport('copywritingExcel', rows, async (item: any) => {
    const scene = safeString(item['页面/场景']);
    const type = safeString(item['类型']);
    const trigger = safeString(item['触发条件']);
    const value = safeString(item['文案内容']);
    const action = safeString(item['按钮/操作']);
    const remark = safeString(item['备注']);

    if (!value) throw new Error('文案内容不能为空');

    const key = [scene, type, trigger].filter(Boolean).join('.');

    const parsed = CopywritingImportSchema.safeParse({
      key: key || 'global',
      value,
      scene,
      type,
      trigger,
      action: action && action !== '-' ? action : null,
      remark,
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '校验失败');
    const d = parsed.data;

    const existing = await db.query<{ key: string }>(
      'SELECT key FROM copywriting WHERE key = ?',
      [d.key],
    );

    if (existing.length > 0) {
      await db.run(
        `UPDATE copywriting SET value = ?, scene = ?, type = ?, trigger = ?, action = ?, remark = ? WHERE key = ?`,
        [d.value, d.scene ?? null, d.type ?? null, d.trigger ?? null, d.action ?? null, d.remark ?? null, d.key],
      );
    } else {
      await db.run(
        `INSERT INTO copywriting (key, value, scene, type, trigger, action, remark) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [d.key, d.value, d.scene ?? null, d.type ?? null, d.trigger ?? null, d.action ?? null, d.remark ?? null],
      );
    }
  });

  return report;
}