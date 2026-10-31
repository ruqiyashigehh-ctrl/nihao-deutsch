import { getDatabase } from '../dal/driver';
import { v4 as uuidv4 } from 'uuid';
import { nowIso, fromBool } from '../dal/types';
import type { ImportReport, ImportType } from '@nihao-deutsch/shared';

export interface ImportContext {
  type: ImportType;
  total: number;
  success: number;
  failed: number;
  failures: { row: number; field: string | null; message: string }[];
  startTime: number;
}

export async function runImport<T>(
  type: ImportType,
  items: T[],
  insertFn: (item: T, ctx: ImportContext, index: number) => Promise<void>,
): Promise<ImportReport> {
  const ctx: ImportContext = {
    type, total: items.length, success: 0, failed: 0, failures: [], startTime: Date.now(),
  };

  const db = await getDatabase();
  await db.withTransaction(async () => {
    for (let i = 0; i < items.length; i++) {
      try {
        await insertFn(items[i]!, ctx, i);
        ctx.success++;
      } catch (err: any) {
        ctx.failed++;
        ctx.failures.push({ row: i + 1, field: null, message: err?.message ?? String(err) });
      }
    }
  });

  return {
    type: ctx.type, total: ctx.total, success: ctx.success, failed: ctx.failed,
    failures: ctx.failures, durationMs: Date.now() - ctx.startTime,
  };
}

export { uuidv4, nowIso, fromBool };