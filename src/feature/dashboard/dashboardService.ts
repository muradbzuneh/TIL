import type {
  SQLiteDatabase,
} from 'expo-sqlite';

import {
  getTrackedApps,
  getDailyUsage,
  getGlobalSettings,
  getActiveManualSession,
} from '@/db/repositories';

import {
  getLocalDateKey,
} from '@/db/utils';

import {
  syncTodayUsage,
} from '@/services/usage/usageSyncService';

import {
  usageService,
} from '@/services/usage';

import {
  buildTrackedAppUsage,
} from '@/feature/limits/limitServices';

import {
  buildGlobalUsage,
} from '@/feature/limits/globalLimitService';

import {
  applyLockState,
} from '@/feature/limits/lockStateService';

import type {
  DashboardSummary,
  TrackedAppUsage,
} from '@/types/dashboard';

export async function buildDashboard(
  db: SQLiteDatabase
): Promise<DashboardSummary> {

  const date =
    getLocalDateKey();

  /*
   * Refresh Android usage whenever the dashboard
   * is requested.
   */
  await syncTodayUsage(db);

  const trackedApps =
    await getTrackedApps(db);

  const globalSettings =
    await getGlobalSettings(db);

  const appUsage: TrackedAppUsage[] = [];

  for (
    const app of trackedApps
  ) {

    const usage =
      await getDailyUsage(
        db,
        app.id,
        date
      );

    appUsage.push(
      buildTrackedAppUsage(
        app,
        usage
      )
    );
  }

  const global =
    buildGlobalUsage(
      globalSettings,
      appUsage
    );

  const activeSession =
    await getActiveManualSession(
      db
    );

  /*
   * Keep the native blocker in sync with what the
   * dashboard just calculated, so an app that reached
   * its limit cannot be opened until the daily reset.
   */
  applyLockState(appUsage);

  return {
    date,

    apps:
      appUsage,

    global,

    trackedAppCount:
      appUsage.length,

    activeManualTimerCount:
      activeSession ? 1 : 0,

    usageAccessGranted:
      usageService.isUsageAccessGranted(),

    lastUpdatedAt:
      new Date().toISOString(),
  };
}