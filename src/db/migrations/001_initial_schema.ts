import type { SQLiteDatabase } from 'expo-sqlite';
import { CREATE_TABLES_SQL } from '../schema';

export async function migrateToVersion1(
  db: SQLiteDatabase
): Promise<void> {
  await db.execAsync(CREATE_TABLES_SQL);

  await db.runAsync(
    `
    INSERT OR IGNORE INTO global_settings (
      id,
      daily_limit_seconds,
      is_enabled,
      updated_at
    )
    VALUES (1, 0, 0, ?)
    `,
    new Date().toISOString()
  );
}