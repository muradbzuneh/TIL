import type {
  SQLiteDatabase,
} from 'expo-sqlite';

import {
  addTrackedApp,
  getTrackedApps,
  getTrackedAppById,
  removeTrackedApp,
  updateTrackedAppLimit,
} from '@/db/repositories';

import type {
  TrackedApp,
} from '@/db/repositories';

export type AddInstalledAppInput = {
  packageName: string;
  appName: string;
  iconUri?: string | null;
  dailyLimitSeconds: number;
};

export type AddManualAppInput = {
  appName: string;
  dailyLimitSeconds: number;
};

function normalizeName(
  value: string
): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export async function checkInstalledAppDuplicate(
  db: SQLiteDatabase,
  packageName: string
): Promise<boolean> {
  const apps =
    await getTrackedApps(db);

  return apps.some(
    (app) =>
      app.packageName ===
      packageName
  );
}

export async function checkManualAppDuplicate(
  db: SQLiteDatabase,
  appName: string
): Promise<boolean> {
  const normalized =
    normalizeName(appName);

  const apps =
    await getTrackedApps(db);

  return apps.some(
    (app) =>
      app.source === 'manual' &&
      normalizeName(
        app.appName
      ) === normalized
  );
}

export async function addInstalledApp(
  db: SQLiteDatabase,
  input: AddInstalledAppInput
): Promise<number> {

  const duplicate =
    await checkInstalledAppDuplicate(
      db,
      input.packageName
    );

  if (duplicate) {
    throw new Error(
      'This app is already being tracked.'
    );
  }

  if (
    input.dailyLimitSeconds <= 0
  ) {
    throw new Error(
      'Daily limit must be greater than zero.'
    );
  }

  return addTrackedApp(
    db,
    {
      packageName:
        input.packageName,

      appName:
        input.appName,

      iconUri:
        input.iconUri ?? null,

      source:
        'installed',

      dailyLimitSeconds:
        input.dailyLimitSeconds,
    }
  );
}

export async function addManualApp(
  db: SQLiteDatabase,
  input: AddManualAppInput
): Promise<number> {

  const appName =
    input.appName.trim();

  if (!appName) {
    throw new Error(
      'App name is required.'
    );
  }

  const duplicate =
    await checkManualAppDuplicate(
      db,
      appName
    );

  if (duplicate) {
    throw new Error(
      'A manual app with this name is already being tracked.'
    );
  }

  if (
    input.dailyLimitSeconds <= 0
  ) {
    throw new Error(
      'Daily limit must be greater than zero.'
    );
  }

  return addTrackedApp(
    db,
    {
      packageName: null,

      appName,

      iconUri: null,

      source: 'manual',

      dailyLimitSeconds:
        input.dailyLimitSeconds,
    }
  );
}

export async function updateAppLimit(
  db: SQLiteDatabase,
  appId: number,
  dailyLimitSeconds: number
): Promise<void> {

  const app =
    await getTrackedAppById(
      db,
      appId
    );

  if (!app) {
    throw new Error(
      'Tracked app was not found.'
    );
  }

  if (
    dailyLimitSeconds <= 0
  ) {
    throw new Error(
      'Daily limit must be greater than zero.'
    );
  }

  await updateTrackedAppLimit(
    db,
    appId,
    dailyLimitSeconds
  );
}

/**
 * Removes the tracked app completely.
 *
 * Business rule:
 * A reached/locked app should not be removable
 * from the normal management flow.
 *
 * The caller supplies whether the app is currently
 * reached because usage logic belongs outside the
 * database repository.
 */
export async function removeApp(
  db: SQLiteDatabase,
  app: TrackedApp,
  isLocked: boolean
): Promise<void> {

  if (isLocked) {
    throw new Error(
      'This app has reached its daily limit and cannot be removed until the daily reset.'
    );
  }

  await removeTrackedApp(
    db,
    app.id
  );
}