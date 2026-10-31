import { getDatabase } from '../dal/driver';

export class CheckinRepository {
  async findCheckpoints() {
    const db = await getDatabase();
    return db.query('SELECT * FROM checkpoints ORDER BY name');
  }
  async findCheckpoint(id: string) {
    const db = await getDatabase();
    const rows = await db.query('SELECT * FROM checkpoints WHERE checkpoint_id = ?', [id]);
    return rows[0] ?? null;
  }
  async findWindows(checkpointId: string) {
    const db = await getDatabase();
    return db.query('SELECT * FROM check_windows WHERE checkpoint_id = ?', [checkpointId]);
  }
  async findRecord(userId: string, checkpointId: string, windowId: string) {
    const db = await getDatabase();
    const rows = await db.query('SELECT * FROM check_records WHERE user_id = ? AND checkpoint_id = ? AND window_id = ?', [userId, checkpointId, windowId]);
    return rows[0] ?? null;
  }
  async insertRecord(r: { recordId: string; userId: string; checkpointId: string; windowId: string; latitude: number; longitude: number; scannedValue: string | null; checkedAt: string }) {
    const db = await getDatabase();
    await db.run(
      'INSERT INTO check_records (record_id, user_id, checkpoint_id, window_id, latitude, longitude, scanned_value, checked_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [r.recordId, r.userId, r.checkpointId, r.windowId, r.latitude, r.longitude, r.scannedValue, r.checkedAt],
    );
  }
  async findRecordsByUser(userId: string) {
    const db = await getDatabase();
    return db.query(
      `SELECT cr.*, cp.name as checkpoint_name FROM check_records cr JOIN checkpoints cp ON cr.checkpoint_id = cp.checkpoint_id WHERE cr.user_id = ? ORDER BY cr.checked_at DESC`,
      [userId],
    );
  }
}
export const checkinRepository = new CheckinRepository();