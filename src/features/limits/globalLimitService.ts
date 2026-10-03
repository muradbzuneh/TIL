import type {
  SQLiteDatabase,
} from 'expo-sqlite';

import type {
  GlobalSettings,
} from '@/database/repositories';

import {
  getGlobalSettings,
  updateGlobalSettings,
} from '@/database/repositories';

import {
  calculateProgress,
  calculateRemaining,
  getUsageStatus,
} from '@/utils/usage';

import type {
  TrackedAppUsage,
  GlobalUsageSummary,
} from '@/types/dashboard';

export function buildGlobalUsage(
  settings: GlobalSettings,
  apps: TrackedAppUsage[]
): GlobalUsageSummary {

  /*
   * Global usage includes every active app tracked by TIL.
   *
   * It does NOT depend on whether an individual app
   * has its own daily limit.
   */
  const usedSeconds =
    apps.reduce(
      (
        total,
        app
      ) =>
        total +
        app.usedSeconds,
      0
    );

  const isEnabled =
    settings.isEnabled &&
    settings.dailyLimitSeconds > 0;

  if (!isEnabled) {

    return {
      isEnabled: false,

      dailyLimitSeconds: 0,

      usedSeconds,

      remainingSeconds: 0,

      progressPercent: 0,

      isReached: false,

      status: 'normal',
    };
  }

  const remainingSeconds =
    calculateRemaining(
      usedSeconds,
      settings.dailyLimitSeconds
    );

  const progressPercent =
    calculateProgress(
      usedSeconds,
      settings.dailyLimitSeconds
    );

  const status =
    getUsageStatus(
      usedSeconds,
      settings.dailyLimitSeconds
    );

  return {
    isEnabled: true,

    dailyLimitSeconds:
      settings.dailyLimitSeconds,

    usedSeconds,

    remainingSeconds,

    progressPercent,

    isReached:
      status === 'reached',

    status,
  };
}

/**
 * Task 9 — global daily limit.
 *
 * Enables or replaces the combined limit that
 * applies across every tracked app.
 */
export async function setGlobalLimit(
  db: SQLiteDatabase,
  dailyLimitSeconds: number
): Promise<void> {

  if (
    dailyLimitSeconds <= 0
  ) {
    throw new Error(
      'Global daily limit must be greater than zero.'
    );
  }

  await updateGlobalSettings(
    db,
    dailyLimitSeconds,
    true
  );
}

/**
 * Task 9 — turns the global limit off
 * while keeping the last configured value.
 */
export async function disableGlobalLimit(
  db: SQLiteDatabase
): Promise<void> {

  const current =
    await getGlobalSettings(
      db
    );

  await updateGlobalSettings(
    db,
    current.dailyLimitSeconds,
    false
  );
}
