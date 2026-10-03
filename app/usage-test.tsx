import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useDatabase,
} from '@/db/useDatabase';

import {
  getTrackedApps,
} from '@/db/repositories';

import {
  getLocalDateKey,
} from '@/db/utils';

import {
  syncTodayUsage,
} from '@/services/usage/usageSyncService';

import {
  usageService,
} from '@/services/usage';

type UsageRow = {
  packageName: string;
  appName: string;
  usageSeconds: number;
};

function formatDuration(
  totalSeconds: number
): string {

  const seconds =
    Math.max(
      0,
      Math.floor(totalSeconds)
    );

  const hours =
    Math.floor(
      seconds / 3600
    );

  const minutes =
    Math.floor(
      (seconds % 3600) / 60
    );

  const remainingSeconds =
    seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

export default function UsageTestScreen() {

  const db =
    useDatabase();

  const [rows, setRows] =
    useState<UsageRow[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [permissionGranted, setPermissionGranted] =
    useState(
      usageService.isUsageAccessGranted()
    );

  const [lastSync, setLastSync] =
    useState<string | null>(null);

  async function loadUsage() {

    try {

      setLoading(true);

      const granted =
        usageService.isUsageAccessGranted();

      setPermissionGranted(
        granted
      );

      if (!granted) {

        Alert.alert(
          'Usage Access Required',
          'Enable Usage Access for TIL in Android Settings first.'
        );

        return;
      }

      const trackedApps =
        await getTrackedApps(db);

      const packageNames =
        trackedApps
          .filter(
            (app) =>
              app.packageName !== null
          )
          .map(
            (app) =>
              app.packageName as string
          );

      if (
        packageNames.length === 0
      ) {

        Alert.alert(
          'No Tracked Apps',
          'Add an installed app to TIL before testing usage.'
        );

        return;
      }

      const result =
        usageService.getTodayUsageForPackages(
          packageNames
        );

      const usageMap =
        new Map(
          result.apps.map(
            (app) => [
              app.packageName,
              app.usageSeconds,
            ]
          )
        );

      const nextRows =
        trackedApps
          .filter(
            (app) =>
              app.packageName !== null
          )
          .map(
            (app) => ({
              packageName:
                app.packageName as string,

              appName:
                app.appName,

              usageSeconds:
                usageMap.get(
                  app.packageName as string
                ) ?? 0,
            })
          );

      setRows(
        nextRows
      );

      setLastSync(
        new Date(
          result.queriedAtMillis
        ).toLocaleTimeString()
      );

    } catch (error) {

      console.error(
        'Usage test failed:',
        error
      );

      Alert.alert(
        'Usage Error',
        'TIL could not read Android usage statistics.'
      );

    } finally {

      setLoading(false);
    }
  }

  async function syncDatabase() {

    try {

      setLoading(true);

      const result =
        await syncTodayUsage(db);

      setPermissionGranted(
        result.hasUsageAccess
      );

      if (
        !result.hasUsageAccess
      ) {

        Alert.alert(
          'Usage Access Required',
          'Enable Usage Access first.'
        );

        return;
      }

      setLastSync(
        new Date().toLocaleTimeString()
      );

      Alert.alert(
        'Sync Complete',
        `${result.syncedApps} tracked apps synchronized for ${result.date}.`
      );

    } catch (error) {

      console.error(
        'Database sync failed:',
        error
      );

      Alert.alert(
        'Sync Error',
        'Could not synchronize usage into SQLite.'
      );

    } finally {

      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={styles.container}
    >

      <View style={styles.header}>

        <Text style={styles.title}>
          TIL Usage Test
        </Text>

        <Text style={styles.subtitle}>
          Android UsageStatsManager
        </Text>

      </View>

      <View style={styles.statusCard}>

        <Text style={styles.statusLabel}>
          Usage Access
        </Text>

        <Text
          style={[
            styles.statusValue,
            permissionGranted
              ? styles.granted
              : styles.denied,
          ]}
        >
          {permissionGranted
            ? 'Granted'
            : 'Not granted'}
        </Text>

        <Text style={styles.date}>
          Today: {getLocalDateKey()}
        </Text>

      </View>

      <View style={styles.actions}>

        <Pressable
          style={styles.button}
          disabled={loading}
          onPress={loadUsage}
        >
          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.buttonText}>
              Read Android Usage
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          disabled={loading}
          onPress={syncDatabase}
        >
          <Text
            style={
              styles.secondaryButtonText
            }
          >
            Sync Usage to SQLite
          </Text>
        </Pressable>

      </View>

      {lastSync && (
        <Text style={styles.lastSync}>
          Last query: {lastSync}
        </Text>
      )}

      <FlatList
        data={rows}
        keyExtractor={(item) =>
          item.packageName
        }
        contentContainerStyle={
          styles.list
        }
        renderItem={({ item }) => (

          <View style={styles.appCard}>

            <View style={styles.appInfo}>

              <Text style={styles.appName}>
                {item.appName}
              </Text>

              <Text
                style={
                  styles.packageName
                }
              >
                {item.packageName}
              </Text>

            </View>

            <Text style={styles.usage}>
              {formatDuration(
                item.usageSeconds
              )}
            </Text>

          </View>
        )}
        ListEmptyComponent={

          <Text style={styles.empty}>
            No usage results yet.
          </Text>
        }
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 4,
    color: '#64748B',
  },

  statusCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },

  statusLabel: {
    fontSize: 14,
    color: '#64748B',
  },

  statusValue: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '700',
  },

  granted: {
    color: '#16A34A',
  },

  denied: {
    color: '#DC2626',
  },

  date: {
    marginTop: 8,
    color: '#64748B',
  },

  actions: {
    paddingHorizontal: 16,
    marginTop: 12,
  },

  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#208AEF',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  secondaryButton: {
    minHeight: 48,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },

  secondaryButtonText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '700',
  },

  lastSync: {
    marginHorizontal: 16,
    marginTop: 12,
    color: '#64748B',
    textAlign: 'center',
  },

  list: {
    padding: 16,
  },

  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },

  appInfo: {
    flex: 1,
    paddingRight: 12,
  },

  appName: {
    fontSize: 16,
    fontWeight: '700',
  },

  packageName: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748B',
  },

  usage: {
    fontSize: 16,
    fontWeight: '700',
  },

  empty: {
    paddingTop: 40,
    textAlign: 'center',
    color: '#64748B',
  },

});