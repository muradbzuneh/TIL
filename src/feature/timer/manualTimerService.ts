import type {
  SQLiteDatabase,
} from 'expo-sqlite';

import {
  addManualUsage,
  createManualSession,
  finishManualSession,
  getActiveManualSession,
} from '@/db/repositories';

import {
  getLocalDateKey,
} from '@/db/utils';

export async function startManualTimer(
  db: SQLiteDatabase,
  trackedAppId: number
): Promise<number> {

  const existing =
    await getActiveManualSession(
      db
    );

  if (existing) {
    throw new Error(
      'Another manual timer is already running.'
    );
  }

  const startedAt =
    new Date();

  return createManualSession(
    db,
    trackedAppId,
    startedAt.toISOString(),
    getLocalDateKey(
      startedAt
    )
  );
}

export async function stopManualTimer(
  db: SQLiteDatabase
): Promise<void> {

  const session =
    await getActiveManualSession(
      db
    );

  if (!session) {
    throw new Error(
      'No manual timer is currently running.'
    );
  }

  const endedAt =
    new Date();

  const startedAt =
    new Date(
      session.startedAt
    );

  const durationSeconds =
    Math.max(
      0,
      Math.floor(
        (
          endedAt.getTime() -
          startedAt.getTime()
        ) / 1000
      )
    );

  await finishManualSession(
    db,
    session.id,
    endedAt.toISOString(),
    durationSeconds
  );

  /*
   * Task 7 — a finished timer becomes manual usage,
   * which is what the limit and dashboard logic reads
   * for apps without a package name.
   */
  if (durationSeconds > 0) {

    await addManualUsage(
      db,
      {
        trackedAppId:
          session.trackedAppId,

        date: session.date,

        additionalSeconds:
          durationSeconds,
      }
    );
  }
}