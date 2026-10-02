import '../src/global.css';

import { SQLiteProvider } from 'expo-sqlite';
import { Stack } from 'expo-router';

import { initializeDatabase } from '@/db/database';

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName="til.db"
      onInit={initializeDatabase}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </SQLiteProvider>
  );
}
