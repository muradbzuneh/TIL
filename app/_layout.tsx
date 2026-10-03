import '../src/global.css';

import {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import {
  Stack,
} from 'expo-router';

import { SQLiteProvider } from 'expo-sqlite';

import {
  getGlobalSettings,
} from '@/database/repositories';

import {
  initializeDatabase,
} from '@/database/database';

import {
  useDatabase,
} from '@/database/useDatabase';

import {
  colors,
} from '@/theme';

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName="til.db"
      onInit={initializeDatabase}
    >
      <Gate />
    </SQLiteProvider>
  );
}

/**
 * First launch runs the setup stack, afterwards the
 * app uses the tabs plus stack screens.
 *
 * The gate lives here so `/(tabs)/index.tsx` can stay
 * the home route without clashing with a redirect
 * route at "/".
 */
function Gate() {

  const db = useDatabase();

  const [
    state,
    setState,
  ] = useState<
    'checking' | 'setup' | 'app'
  >('checking');

  useEffect(() => {

    getGlobalSettings(db)

      .then((settings) => {

        setState(
          settings.onboardingCompleted
            ? 'app'
            : 'setup'
        );
      })

      .catch((error) => {

        console.error(
          'Startup check failed:',
          error
        );

        setState('app');
      });
  }, [db]);

  if (state === 'checking') {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.blue}
        />
      </View>
    );
  }

  if (state === 'setup') {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="(setup)/welcome"
        />

        <Stack.Screen
          name="(setup)/usage-access"
        />

        <Stack.Screen
          name="(setup)/overlay"
        />

        <Stack.Screen
          name="(setup)/ready"
        />
      </Stack>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />

      <Stack.Screen name="add-app" />

      <Stack.Screen name="app/[id]" />

      <Stack.Screen name="settings/permissions" />

      <Stack.Screen
        name="settings/global-limit"
      />

      <Stack.Screen name="settings/privacy" />

      <Stack.Screen name="settings/about" />
    </Stack>
  );
}

const styles = StyleSheet.create({

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      colors.background,
  },
});