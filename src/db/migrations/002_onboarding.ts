import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * v2 adds the first-launch onboarding flag.
 *
 * ALTER TABLE ADD COLUMN is safe here because this
 * migration runs exactly once per install, both for
 * fresh databases and for existing ones.
 */
export async function migrateToVersion2(
  db: SQLiteDatabase
): Promise<void> {

  await db.execAsync(`
    ALTER TABLE global_settings
    ADD COLUMN onboarding_completed
      INTEGER NOT NULL DEFAULT 0;
  `);
}