import type { SQLiteDatabase } from 'expo-sqlite';

export type DailyUsage = {
  id: number;
  trackedAppId: number;
  date: string;
  systemUsageSeconds: number;
  manualUsageSeconds: number;
  totalUsageSeconds: number;
  lastSyncedAt: string | null;
};

type DailyUsageRow = {
  id: number;
  tracked_app_id: number;
  date: string;
  system_usage_seconds: number;
  manual_usage_seconds: number;
  total_usage_seconds: number;
  last_synced_at: string | null;
};

function mapDailyUsage(
  row: DailyUsageRow
): DailyUsage {

  return {
    id: row.id,

    trackedAppId:
      row.tracked_app_id,

    date:
      row.date,

    systemUsageSeconds:
      row.system_usage_seconds,

    manualUsageSeconds:
      row.manual_usage_seconds,

    totalUsageSeconds:
      row.total_usage_seconds,

    lastSyncedAt:
      row.last_synced_at,
  };
}

export async function getDailyUsage(
  db: SQLiteDatabase,
  trackedAppId: number,
  date: string
): Promise<DailyUsage | null> {

  const row =
    await db.getFirstAsync<DailyUsageRow>(
      `
      SELECT *
      FROM daily_usage
      WHERE tracked_app_id = ?
        AND date = ?
      `,
      trackedAppId,
      date
    );

  return row
    ? mapDailyUsage(row)
    : null;
}

export async function upsertDailyUsage(
  db: SQLiteDatabase,
  input: {
    trackedAppId: number;
    date: string;
    systemUsageSeconds: number;
    manualUsageSeconds: number;
    lastSyncedAt?: string | null;
  }
): Promise<void> {

  const totalUsageSeconds =
    input.systemUsageSeconds +
    input.manualUsageSeconds;

  await db.runAsync(
    `
    INSERT INTO daily_usage (
      tracked_app_id,
      date,
      system_usage_seconds,
      manual_usage_seconds,
      total_usage_seconds,
      last_synced_at
    )
    VALUES (?, ?, ?, ?, ?, ?)

    ON CONFLICT(tracked_app_id, date)
    DO UPDATE SET
      system_usage_seconds =
        excluded.system_usage_seconds,

      manual_usage_seconds =
        excluded.manual_usage_seconds,

      total_usage_seconds =
        excluded.total_usage_seconds,

      last_synced_at =
        excluded.last_synced_at
    `,
    input.trackedAppId,
    input.date,
    input.systemUsageSeconds,
    input.manualUsageSeconds,
    totalUsageSeconds,
    input.lastSyncedAt ?? null
  );
}

/**
 * Updates only the Android/system usage value.
 *
 * This is intentionally separate from the full upsert so
 * Android synchronization never destroys manual-session data.
 */
export async function upsertSystemUsage(
  db: SQLiteDatabase,
  input: {
    trackedAppId: number;
    date: string;
    systemUsageSeconds: number;
    lastSyncedAt?: string | null;
  }
): Promise<void> {

  const systemUsageSeconds =
    Math.max(
      0,
      input.systemUsageSeconds
    );

  const existing =
    await getDailyUsage(
      db,
      input.trackedAppId,
      input.date
    );

  const manualUsageSeconds =
    existing?.manualUsageSeconds ?? 0;

  const totalUsageSeconds =
    systemUsageSeconds +
    manualUsageSeconds;

  await db.runAsync(
    `
    INSERT INTO daily_usage (
      tracked_app_id,
      date,
      system_usage_seconds,
      manual_usage_seconds,
      total_usage_seconds,
      last_synced_at
    )
    VALUES (?, ?, ?, ?, ?, ?)

    ON CONFLICT(tracked_app_id, date)
    DO UPDATE SET
      system_usage_seconds =
        excluded.system_usage_seconds,

      manual_usage_seconds =
        excluded.manual_usage_seconds,

      total_usage_seconds =
        excluded.total_usage_seconds,

      last_synced_at =
        excluded.last_synced_at
    `,
    input.trackedAppId,
    input.date,
    systemUsageSeconds,
    manualUsageSeconds,
    totalUsageSeconds,
    input.lastSyncedAt ?? null
  );
}

/**
 * Most recent usage rows for one tracked app.
 *
 * Powers the per-app details view.
 */
export async function getRecentDailyUsage(
  db: SQLiteDatabase,
  trackedAppId: number,
  days = 7
): Promise<DailyUsage[]> {
  const rows =
    await db.getAllAsync<DailyUsageRow>(
      `
      SELECT *
      FROM daily_usage
      WHERE tracked_app_id = ?
      ORDER BY date DESC
      LIMIT ?
      `,
      trackedAppId,
      days
    );

  return rows.map(mapDailyUsage);
}

export async function addManualUsage(
  db: SQLiteDatabase,
  input: {
    trackedAppId: number;
    date: string;
    additionalSeconds: number;
  }
): Promise<void> {

  const existing =
    await getDailyUsage(
      db,
      input.trackedAppId,
      input.date
    );

  const systemUsageSeconds =
    existing?.systemUsageSeconds ?? 0;

  const currentManualUsageSeconds =
    existing?.manualUsageSeconds ?? 0;

  const manualUsageSeconds =
    currentManualUsageSeconds +
    Math.max(
      0,
      input.additionalSeconds
    );

  const totalUsageSeconds =
    systemUsageSeconds +
    manualUsageSeconds;

  await db.runAsync(
    `
    INSERT INTO daily_usage (
      tracked_app_id,
      date,
      system_usage_seconds,
      manual_usage_seconds,
      total_usage_seconds,
      last_synced_at
    )
    VALUES (?, ?, ?, ?, ?, ?)

    ON CONFLICT(tracked_app_id, date)
    DO UPDATE SET
      manual_usage_seconds =
        excluded.manual_usage_seconds,

      total_usage_seconds =
        excluded.total_usage_seconds
    `,
    input.trackedAppId,
    input.date,
    systemUsageSeconds,
    manualUsageSeconds,
    totalUsageSeconds,
    existing?.lastSyncedAt ?? null
  );
}