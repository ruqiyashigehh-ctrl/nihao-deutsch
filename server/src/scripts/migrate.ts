import { migrate } from '../dal/migrate';

migrate()
  .then(() => {
    console.log('[Sprung] Migration completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Sprung] Migration failed:', err);
    process.exit(1);
  });