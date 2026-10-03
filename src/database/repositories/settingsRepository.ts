import type { SQLiteDatabase } from 'expo-sqlite';

export type GlobalSettings = {
  dailyLimitSeconds: number;
  isEnabled: boolean;
  onboardingCompleted: boolean;
  updatedAt: string;
};

export async function getGlobalSettings(
  db: SQLiteDatabase
): Promise<GlobalSettings> {
  const row = await db.getFirstAsync<{
    daily_limit_seconds: number;
    is_enabled: number;
    onboarding_completed: number;
    updated_at: string;
  }>(
    `
    SELECT
      daily_limit_seconds,
      is_enabled,
      onboarding_completed,
      updated_at
    FROM global_settings
    WHERE id = 1
    `
  );

  return {
    dailyLimitSeconds: row?.daily_limit_seconds ?? 0,
    isEnabled: row?.is_enabled === 1,
    onboardingCompleted: row?.onboarding_completed === 1,
    updatedAt: row?.updated_at ?? new Date().toISOString(),
  };
}

export async function completeOnboarding(
  db: SQLiteDatabase
): Promise<void> {
  await db.runAsync(
    `
    UPDATE global_settings
    SET
      onboarding_completed = 1,
      updated_at = ?
    WHERE id = 1
    `,
    new Date().toISOString()
  );
}

export async function updateGlobalSettings(
  db: SQLiteDatabase,
  dailyLimitSeconds: number,
  isEnabled: boolean
): Promise<void> {
  await db.runAsync(
    `
    UPDATE global_settings
    SET
      daily_limit_seconds = ?,
      is_enabled = ?,
      updated_at = ?
    WHERE id = 1
    `,
    dailyLimitSeconds,
    isEnabled ? 1 : 0,
    new Date().toISOString()
  );
}