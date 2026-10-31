import { v4 as uuidv4 } from 'uuid';
import { checkinRepository } from '../repositories/checkin.repository';
import { AppError } from '../middleware/errorHandler';
import { nowIso, toBool } from '../dal/types';
import { isInGeofence, isInTimeWindow } from '../utils/geo';

export class CheckinService {
  async getCheckpoints() {
    const rows = await checkinRepository.findCheckpoints();
    return rows.map((c: any) => ({
      checkpointId: c.checkpoint_id, name: c.name, latitude: c.latitude,
      longitude: c.longitude, radius: c.radius, requireScan: toBool(c.require_scan),
    }));
  }

  async checkin(userId: string, params: { checkpointId: string; windowId: string; latitude: number; longitude: number; accuracy: number; scannedValue?: string | null }) {
    const cp = await checkinRepository.findCheckpoint(params.checkpointId);
    if (!cp) throw new AppError(404, '打卡点不存在', 'NOT_FOUND');

    if (!isInGeofence(params.latitude, params.longitude, cp.latitude, cp.longitude, cp.radius)) {
      throw new AppError(422, '不在打卡范围内', 'OUT_OF_RANGE');
    }

    const windows = await checkinRepository.findWindows(params.checkpointId);
    const window = windows.find((w: any) => w.window_id === params.windowId);
    if (!window) throw new AppError(404, '打卡时段不存在', 'NOT_FOUND');

    const weekdays = JSON.parse(window.weekdays) as number[];
    if (!isInTimeWindow(new Date(), window.start_time, window.end_time, weekdays)) {
      throw new AppError(422, '不在打卡时段内', 'OUT_OF_WINDOW');
    }

    if (toBool(cp.require_scan) && !params.scannedValue) {
      throw new AppError(422, '请先扫码', 'SCAN_REQUIRED');
    }

    const existing = await checkinRepository.findRecord(userId, params.checkpointId, params.windowId);
    if (existing) throw new AppError(422, '今日已打卡', 'ALREADY_CHECKED');

    const recordId = uuidv4();
    const checkedAt = nowIso();
    await checkinRepository.insertRecord({
      recordId, userId, checkpointId: params.checkpointId, windowId: params.windowId,
      latitude: params.latitude, longitude: params.longitude,
      scannedValue: params.scannedValue ?? null, checkedAt,
    });

    return { recordId, checkpointName: cp.name, checkedAt, message: '打卡成功' };
  }

  async getRecords(userId: string) {
    const rows = await checkinRepository.findRecordsByUser(userId);
    return rows.map((r: any) => ({
      recordId: r.record_id, checkpointId: r.checkpoint_id, checkpointName: r.checkpoint_name,
      windowId: r.window_id, latitude: r.latitude, longitude: r.longitude,
      scannedValue: r.scanned_value, checkedAt: r.checked_at,
    }));
  }
}

export const checkinService = new CheckinService();