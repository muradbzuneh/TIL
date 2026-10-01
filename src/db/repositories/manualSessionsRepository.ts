import type { SQLiteDatabase } from 'expo-sqlite';

export type ManualSession = {
  id: number;
  trackedAppId: number;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  date: string;
};

export async function createManualSession(
  db: SQLiteDatabase,
  trackedAppId: number,
  startedAt: string,
  date: string
): Promise<number> {
  const result = await db.runAsync(
    `
    INSERT INTO manual_sessions (
      tracked_app_id,
      started_at,
      ended_at,
      duration_seconds,
      date
    )
    VALUES (?, ?, NULL, 0, ?)
    `,
    trackedAppId,
    startedAt,
    date
  );

  return result.lastInsertRowId;
}

export async function finishManualSession(
  db: SQLiteDatabase,
  sessionId: number,
  endedAt: string,
  durationSeconds: number
): Promise<void> {
  await db.runAsync(
    `
    UPDATE manual_sessions
    SET
      ended_at = ?,
      duration_seconds = ?
    WHERE id = ?
    `,
    endedAt,
    durationSeconds,
    sessionId
  );
}

export async function getActiveManualSession(
  db: SQLiteDatabase
): Promise<ManualSession | null> {
  return db.getFirstAsync<ManualSession>(
    `
    SELECT
      id,
      tracked_app_id AS trackedAppId,
      started_at AS startedAt,
      ended_at AS endedAt,
      duration_seconds AS durationSeconds,
      date
    FROM manual_sessions
    WHERE ended_at IS NULL
    ORDER BY started_at DESC
    LIMIT 1
    `
  );
}