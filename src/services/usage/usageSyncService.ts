import type { SQLiteDatabase } from 'expo-sqlite';

import {
  getTrackedApps,
  upsertSystemUsage,
} from '@/database/repositories';

import {
  getLocalDateKey,
} from '@/database/utils';

import {
  usageService,
} from './usageService.android';

export type UsageSyncResult = {
  hasUsageAccess: boolean;
  syncedApps: number;
  date: string;
  queriedAt: string;
};

export async function syncTodayUsage(
  db: SQLiteDatabase
): Promise<UsageSyncResult> {

  const trackedApps =
    await getTrackedApps(db);

  const date =
    getLocalDateKey();

  const packageNames =
    trackedApps
      .filter(
        (app) =>
          app.packageName !== null
      )
      .map(
        (app) =>
          app.packageName as string
      );

  const hasUsageAccess =
    usageService.isUsageAccessGranted();

  if (
    packageNames.length === 0
  ) {
    return {
      hasUsageAccess,

      syncedApps: 0,

      date,

      queriedAt:
        new Date().toISOString(),
    };
  }

  if (!hasUsageAccess) {
    return {
      hasUsageAccess: false,

      syncedApps: 0,

      date,

      queriedAt:
        new Date().toISOString(),
    };
  }

  const result =
    usageService.getTodayUsageForPackages(
      packageNames
    );

  const usageMap =
    new Map(
      result.apps.map(
        (app) => [
          app.packageName,
          app.usageSeconds,
        ]
      )
    );

  const syncedAt =
    new Date().toISOString();

  for (const trackedApp of trackedApps) {

    if (!trackedApp.packageName) {
      continue;
    }

    const systemUsageSeconds =
      usageMap.get(
        trackedApp.packageName
      ) ?? 0;

    await upsertSystemUsage(
      db,
      {
        trackedAppId:
          trackedApp.id,

        date,

        systemUsageSeconds,

        lastSyncedAt:
          syncedAt,
      }
    );
  }

  return {
    hasUsageAccess: true,

    syncedApps:
      packageNames.length,

    date,

    queriedAt: syncedAt,
  };
}