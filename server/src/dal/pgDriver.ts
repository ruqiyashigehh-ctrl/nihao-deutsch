import pg from 'pg';
import type { Database as IDatabase, QueryResult } from './driver';

export class PgDatabase implements IDatabase {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({ connectionString, max: 10 });
  }

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.pool.query(sql, params as unknown[]);
    return result.rows as T[];
  }

  async run(sql: string, params: unknown[] = []): Promise<QueryResult> {
    const result = await this.pool.query(sql, params as unknown[]);
    return { changes: result.rowCount ?? 0 };
  }

  async withTransaction<T>(fn: () => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn();
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}