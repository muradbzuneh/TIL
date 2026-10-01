import * as SQLite from 'expo-sqlite';

import { DATABASE_NAME } from '@/constants/app';

import { migrate } from './migrations';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
    await migrate(db);
    return db;
  });

  return databasePromise;
}

export { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
