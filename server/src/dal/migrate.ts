import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDatabase } from './driver';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '..', '..', '..', 'data', 'migrations');

export async function migrate(): Promise<void> {
  const db = await getDatabase();

  await db.run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const applied = await db.query<{ version: string }>(
    'SELECT version FROM schema_migrations',
  );
  const appliedSet = new Set(applied.map((r) => r.version));

  for (const file of files) {
    const version = file.replace(/\.sql$/, '');
    if (appliedSet.has(version)) {
      console.log(`[migrate] ${version} — already applied, skip`);
      continue;
    }

    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
    console.log(`[migrate] ${version} — applying...`);

    await db.withTransaction(async () => {
      const cleanedSql = sql
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => !line.startsWith('--'))
        .join('\n');

      const statements = cleanedSql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        await db.run(stmt);
      }

      await db.run(
        'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        [version, new Date().toISOString()],
      );
    });

    console.log(`[migrate] ${version} — done`);
  }
}