import type { SQLiteDatabase } from 'expo-sqlite';
import { DATABASE_VERSION } from './schema';
import { migrateToVersion1 } from './migrations/001_initial_schema';

export async function initializeDatabase(
  db: SQLiteDatabase
): Promise<void> {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
  `);

  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;'
  );

  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await migrateToVersion1(db);

    await db.execAsync(`
      PRAGMA user_version = ${DATABASE_VERSION};
    `);
  }
}