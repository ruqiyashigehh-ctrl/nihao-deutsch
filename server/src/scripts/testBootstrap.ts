
import { migrate } from '../dal/migrate';
import { getDatabase } from '../dal/driver';
import { seedDemoUsers } from './seedDemoUsers';

async function test() {
  console.log('=== Running migrate ===');
  await migrate();

  console.log('=== Seeding demo users ===');
  await seedDemoUsers();

  console.log('=== Testing DB queries ===');
  const db = await getDatabase();

  const tables = await db.query<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
  );
  console.log('Tables:', tables.map((t) => t.name).join(', '));

  const users = await db.query<{ student_no: string; role: string }>(
    'SELECT student_no, role FROM users',
  );
  console.log('Users:', JSON.stringify(users));

  const templates = await db.query<{ code: string; title: string }>(
    'SELECT code, title FROM push_templates',
  );
  console.log('Templates:', JSON.stringify(templates));

  const checkpoints = await db.query<{ name: string }>(
    'SELECT name FROM checkpoints',
  );
  console.log('Checkpoints:', JSON.stringify(checkpoints));

  console.log('=== All tests passed ===');
  process.exit(0);
}

test().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});