import { SQLiteProvider } from 'expo-sqlite';
import { Stack } from 'expo-router';

import { initializeDatabase } from '@/src/database/database';

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