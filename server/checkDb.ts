import { getDatabase } from './src/dal/driver';

async function check() {
  const db = await getDatabase();

  const users = await db.query<any>('SELECT user_id, student_no, name, role, class_id, is_first_bind, status FROM users');
  console.log('=== Users ===');
  console.log(JSON.stringify(users, null, 2));

  const wordCount = await db.query<any>('SELECT COUNT(*) as c FROM words');
  console.log('\n=== Words count ===', wordCount[0].c);

  const grammarCount = await db.query<any>('SELECT COUNT(*) as c FROM grammar_points');
  console.log('=== Grammar count ===', grammarCount[0].c);

  const exerciseCount = await db.query<any>('SELECT COUNT(*) as c FROM grammar_exercises');
  console.log('=== Exercises count ===', exerciseCount[0].c);

  const classCount = await db.query<any>('SELECT COUNT(*) as c FROM classes');
  console.log('=== Classes count ===', classCount[0].c);

  const classes = await db.query<any>('SELECT * FROM classes');
  console.log('=== Classes ===');
  console.log(JSON.stringify(classes, null, 2));

  process.exit(0);
}
check().catch((e) => { console.error(e); process.exit(1); });