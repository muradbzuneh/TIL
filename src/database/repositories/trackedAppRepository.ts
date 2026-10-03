import type { SQLiteDatabase } from 'expo-sqlite';

export type TrackedApp = {
  id: number;
  packageName: string | null;
  appName: string;
  iconUri: string | null;
  source: 'installed' | 'manual';
  dailyLimitSeconds: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type TrackedAppRow = {
  id: number;
  package_name: string | null;
  app_name: string;
  icon_uri: string | null;
  source: 'installed' | 'manual';
  daily_limit_seconds: number;
  is_active: number;
  created_at: string;
  updated_at: string;
};

function mapTrackedApp(row: TrackedAppRow): TrackedApp {
  return {
    id: row.id,
    packageName: row.package_name,
    appName: row.app_name,
    iconUri: row.icon_uri,
    source: row.source,
    dailyLimitSeconds: row.daily_limit_seconds,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getTrackedApps(
  db: SQLiteDatabase
): Promise<TrackedApp[]> {
  const rows = await db.getAllAsync<TrackedAppRow>(
    `
    SELECT *
    FROM tracked_apps
    WHERE is_active = 1
    ORDER BY created_at DESC
    `
  );

  return rows.map(mapTrackedApp);
}

export async function getTrackedAppById(
  db: SQLiteDatabase,
  id: number
): Promise<TrackedApp | null> {
  const row = await db.getFirstAsync<TrackedAppRow>(
    `
    SELECT *
    FROM tracked_apps
    WHERE id = ?
    `,
    id
  );

  return row ? mapTrackedApp(row) : null;
}

export async function addTrackedApp(
  db: SQLiteDatabase,
  input: {
    packageName?: string | null;
    appName: string;
    iconUri?: string | null;
    source: 'installed' | 'manual';
    dailyLimitSeconds: number;
  }
): Promise<number> {
  const now = new Date().toISOString();

  const result = await db.runAsync(
    `
    INSERT INTO tracked_apps (
      package_name,
      app_name,
      icon_uri,
      source,
      daily_limit_seconds,
      is_active,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `,
    input.packageName ?? null,
    input.appName,
    input.iconUri ?? null,
    input.source,
    input.dailyLimitSeconds,
    now,
    now
  );

  return result.lastInsertRowId;
}

export async function updateTrackedAppLimit(
  db: SQLiteDatabase,
  id: number,
  dailyLimitSeconds: number
): Promise<void> {
  await db.runAsync(
    `
    UPDATE tracked_apps
    SET
      daily_limit_seconds = ?,
      updated_at = ?
    WHERE id = ?
    `,
    dailyLimitSeconds,
    new Date().toISOString(),
    id
  );
}

export async function removeTrackedApp(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync(
    `
    DELETE FROM tracked_apps
    WHERE id = ?
    `,
    id
  );
}