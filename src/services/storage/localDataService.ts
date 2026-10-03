import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Settings -> Reset data.
 *
 * Clears recorded usage but keeps the tracked apps
 * and their daily limits.
 */
export async function resetUsageData(
  db: SQLiteDatabase
): Promise<void> {

  await db.execAsync(`
    DELETE FROM manual_sessions;
    DELETE FROM daily_usage;
  `);
}

/**
 * Settings -> Delete local data.
 *
 * Returns TIL to a fresh install state:
 * no tracked apps, no usage, no global limit and
 * onboarding runs again on next launch.
 */
export async function deleteAllLocalData(
  db: SQLiteDatabase
): Promise<void> {

  await db.execAsync(`
    DELETE FROM daily_usage;
    DELETE FROM manual_sessions;
    DELETE FROM tracked_apps;
  `);

  await db.runAsync(
    `
    UPDATE global_settings
    SET
      daily_limit_seconds = 0,
      is_enabled = 0,
      onboarding_completed = 0,
      updated_at = ?
    WHERE id = 1
    `,
    new Date().toISOString()
  );
}