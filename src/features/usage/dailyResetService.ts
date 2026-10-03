import type {
  SQLiteDatabase,
} from 'expo-sqlite';

import {
  getLocalDateKey,
} from '@/database/utils';

export type DailyState = {
  date: string;

  secondsUntilReset: number;

  isNewDay: boolean;
};

export function getDailyState(
  previousDate?: string | null,
  now = new Date()
): DailyState {

  const currentDate =
    getLocalDateKey(now);

  const isNewDay =
    previousDate !== currentDate;

  const tomorrow =
    new Date(now);

  tomorrow.setHours(
    24,
    0,
    0,
    0
  );

  const secondsUntilReset =
    Math.max(
      0,
      Math.floor(
        (
          tomorrow.getTime() -
          now.getTime()
        ) / 1000
      )
    );

  return {
    date: currentDate,

    secondsUntilReset,

    isNewDay,
  };
}

/**
 * V1 usage data is date-keyed.
 *
 * We don't delete yesterday's records.
 * A new date automatically creates a new daily_usage row.
 *
 * This preserves historical local data while making today's
 * usage start at zero.
 */
export async function ensureToday(
  _db: SQLiteDatabase
): Promise<DailyState> {

  return getDailyState();
}