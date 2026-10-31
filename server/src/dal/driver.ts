import { env } from '../config/env';

export interface QueryResult {
  changes: number;
  lastInsertRowid?: string | number;
}

export interface Database {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  run(sql: string, params?: unknown[]): Promise<QueryResult>;
  withTransaction<T>(fn: () => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

let _db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (_db) return _db;
  if (env.DB_DRIVER === 'sqlite') {
    const { SqliteDatabase } = await import('./sqliteDriver');
    _db = new SqliteDatabase(env.DB_SQLITE_PATH);
  } else {
    const { PgDatabase } = await import('./pgDriver');
    if (!env.DB_URL) throw new Error('DB_URL is required when DB_DRIVER=pg');
    _db = new PgDatabase(env.DB_URL);
  }
  return _db;
}

export async function closeDatabase(): Promise<void> {
  if (_db) {
    await _db.close();
    _db = null;
  }
}