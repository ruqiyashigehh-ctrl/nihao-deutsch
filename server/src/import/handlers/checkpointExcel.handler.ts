import { getDatabase } from '../../dal/driver';
import { runImport, uuidv4, nowIso, fromBool } from '../importRunner';
import { parseXlsx } from '../parsers/xlsx.parser';
import { CheckpointImportSchema } from '@nihao-deutsch/shared';
import type { ImportReport } from '@nihao-deutsch/shared';
import { mapBoolCn, safeNumber, safeString } from './fieldMappers';

export async function handleCheckpointExcel(buffer: Buffer): Promise<ImportReport> {
  const rows = await parseXlsx<any>(buffer, {
    sheetName: '打卡点配置',
  });

  const db = await getDatabase();

  const report = await runImport('checkpointExcel', rows, async (item: any) => {
    const externalId = safeString(item['point_id']);
    const name = safeString(item['name']);
    const latitude = safeNumber(item['latitude']);
    const longitude = safeNumber(item['longitude']);
    const radius = safeNumber(item['radius_m']);
    const isActive = mapBoolCn(safeString(item['is_active']));
    const remark = safeString(item['remark']);

    if (!name) throw new Error('打卡点名称不能为空');
    if (latitude == null || latitude < -90 || latitude > 90) throw new Error(`纬度范围 -90~90，实际: ${latitude}`);
    if (longitude == null || longitude < -180 || longitude > 180) throw new Error(`经度范围 -180~180，实际: ${longitude}`);
    if (radius == null || radius <= 0) throw new Error(`半径必须大于0，实际: ${radius}`);

    const parsed = CheckpointImportSchema.safeParse({
      name,
      latitude,
      longitude,
      radius,
      requireScan: false,
      externalId,
      isActive,
      remark,
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '校验失败');
    const d = parsed.data;

    const existing = externalId
      ? await db.query<{ checkpoint_id: string }>(
          'SELECT checkpoint_id FROM checkpoints WHERE external_id = ?',
          [externalId],
        )
      : [];

    const checkpointId = existing.length > 0 ? existing[0]!.checkpoint_id : uuidv4();

    if (existing.length > 0) {
      await db.run(
        `UPDATE checkpoints SET name = ?, latitude = ?, longitude = ?, radius = ?, external_id = ?, is_active = ?, remark = ? WHERE checkpoint_id = ?`,
        [d.name, d.latitude, d.longitude, d.radius, externalId ?? null, fromBool(d.isActive ?? true), d.remark ?? null, checkpointId],
      );
    } else {
      await db.run(
        `INSERT INTO checkpoints (checkpoint_id, name, latitude, longitude, radius, require_scan, created_at, external_id, is_active, remark) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
        [checkpointId, d.name, d.latitude, d.longitude, d.radius, nowIso(), externalId ?? null, fromBool(d.isActive ?? true), d.remark ?? null],
      );
    }
  });

  return report;
}