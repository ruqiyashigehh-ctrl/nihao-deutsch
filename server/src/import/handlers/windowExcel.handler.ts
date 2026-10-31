import { getDatabase } from '../../dal/driver';
import { runImport, uuidv4, fromBool } from '../importRunner';
import { parseXlsx } from '../parsers/xlsx.parser';
import type { ImportReport } from '@nihao-deutsch/shared';
import { mapBoolCn, safeString } from './fieldMappers';

interface WindowConfig {
  startTime: string;
  endTime: string;
  earliestTime: string | null;
  latestTime: string | null;
  allowLate: boolean;
  weekendEnabled: boolean;
  holidayEnabled: boolean;
}

function parseWindowConfig(rows: any[]): WindowConfig {
  const config: WindowConfig = {
    startTime: '07:30',
    endTime: '07:40',
    earliestTime: '07:25',
    latestTime: '07:45',
    allowLate: false,
    weekendEnabled: false,
    holidayEnabled: false,
  };

  for (const row of rows) {
    const key = safeString(row['配置项']);
    const val = safeString(row['默认值']);
    if (!key || !val) continue;

    if (key.includes('打卡开始时间')) config.startTime = extractTime(val);
    else if (key.includes('打卡结束时间')) config.endTime = extractTime(val);
    else if (key.includes('最早可打卡时间')) config.earliestTime = extractTime(val);
    else if (key.includes('最晚可打卡时间')) config.latestTime = extractTime(val);
    else if (key.includes('是否允许迟到打卡')) config.allowLate = val.includes('允许');
    else if (key.includes('周末是否打卡')) config.weekendEnabled = val.includes('打卡') && !val.includes('不');
    else if (key.includes('节假日是否打卡')) config.holidayEnabled = val.includes('打卡') && !val.includes('不');
  }

  return config;
}

function extractTime(val: string): string {
  const match = val.match(/\d{2}:\d{2}/);
  return match ? match[0] : val;
}

export async function handleWindowExcel(buffer: Buffer): Promise<ImportReport> {
  const rows = await parseXlsx<any>(buffer, {
    sheetName: '时段配置',
  });

  const config = parseWindowConfig(rows);
  const db = await getDatabase();

  const checkpoints = await db.query<{ checkpoint_id: string }>(
    'SELECT checkpoint_id FROM checkpoints LIMIT 1',
  );

  if (checkpoints.length === 0) {
    return {
      type: 'windowExcel',
      total: 0,
      success: 0,
      failed: 0,
      failures: [{ row: 0, field: null, message: '无打卡点，请先导入打卡点配置' }],
      durationMs: 0,
    };
  }

  const checkpointId = checkpoints[0]!.checkpoint_id;

  const existingWindows = await db.query<{ window_id: string }>(
    'SELECT window_id FROM check_windows WHERE checkpoint_id = ? LIMIT 1',
    [checkpointId],
  );

  const windowId = existingWindows.length > 0 ? existingWindows[0]!.window_id : uuidv4();
  const weekdays = JSON.stringify([0, 1, 2, 3, 4, 5, 6]);

  if (existingWindows.length > 0) {
    await db.run(
      `UPDATE check_windows SET start_time = ?, end_time = ?, weekdays = ?, earliest_time = ?, latest_time = ?, allow_late = ?, weekend_enabled = ?, holiday_enabled = ? WHERE window_id = ?`,
      [config.startTime, config.endTime, weekdays, config.earliestTime, config.latestTime, fromBool(config.allowLate), fromBool(config.weekendEnabled), fromBool(config.holidayEnabled), windowId],
    );
  } else {
    await db.run(
      `INSERT INTO check_windows (window_id, checkpoint_id, start_time, end_time, weekdays, earliest_time, latest_time, allow_late, weekend_enabled, holiday_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [windowId, checkpointId, config.startTime, config.endTime, weekdays, config.earliestTime, config.latestTime, fromBool(config.allowLate), fromBool(config.weekendEnabled), fromBool(config.holidayEnabled)],
    );
  }

  return {
    type: 'windowExcel',
    total: rows.length,
    success: 1,
    failed: 0,
    failures: [],
    durationMs: 0,
  };
}