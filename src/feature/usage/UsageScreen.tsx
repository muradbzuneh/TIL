import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useDatabase,
} from '@/db/useDatabase';

import {
  getActiveManualSession,
  getTrackedApps,
} from '@/db/repositories';

import type {
  ManualSession,
  TrackedApp,
} from '@/db/repositories';

import {
  permissionService,
} from '@/services/permission';

import {
  syncTodayUsage,
} from '@/services/usage/usageSyncService';

import {
  stopManualTimer,
} from '@/feature/timer';

import {
  formatDuration,
} from '@/utils/time';

export default function UsageScreen() {

  const db =
    useDatabase();

  const [
    usageAccessGranted,
    setUsageAccessGranted,
  ] =
    useState(false);

  const [
    trackedApps,
    setTrackedApps,
  ] =
    useState<TrackedApp[]>(
      []
    );

  const [
    session,
    setSession,
  ] =
    useState<
      ManualSession | null
    >(null);

  const [
    elapsedSeconds,
    setElapsedSeconds,
  ] =
    useState(0);

  const [
    syncing,
    setSyncing,
  ] =
    useState(false);

  const [
    lastSyncedAt,
    setLastSyncedAt,
  ] =
    useState<string | null>(
      null
    );

  const load =
    useCallback(
      () => {

        return Promise.all([
          getTrackedApps(db),
          getActiveManualSession(db),
        ])

          .then(([apps, active]) => {

            setTrackedApps(apps);

            setSession(active);

            setUsageAccessGranted(
              permissionService.isUsageAccessGranted()
            );
          })

          .catch((error) => {

            console.error(
              'Usage load failed:',
              error
            );
          });
      },
      [db]
    );

  useEffect(() => {

    load();

  }, [load]);

  useEffect(() => {

    if (!session) {
      return;
    }

    const startedAt =
      new Date(
        session.startedAt
      ).getTime();

    const interval =
      setInterval(
        () => {

          setElapsedSeconds(
            Math.max(
              0,
              Math.floor(
                (
                  Date.now() -
                  startedAt
                ) / 1000
              )
            )
          );
        },
        1000
      );

    return () =>
      clearInterval(interval);

  }, [session]);

  const handleSync = useCallback(
    () => {

      setSyncing(true);

      syncTodayUsage(db)

        .then((result) => {

          setUsageAccessGranted(
            result.hasUsageAccess
          );

          setLastSyncedAt(
            new Date(
              result.queriedAt
            ).toISOString()
          );

          if (
            !result.hasUsageAccess
          ) {
            Alert.alert(
              'Usage access is off',
              'Enable Usage Access so TIL can read Android usage.'
            );
          }
        })

        .catch((error) => {

          console.error(
            'Sync failed:',
            error
          );

          Alert.alert(
            'Sync failed',
            error instanceof Error
              ? error.message
              : 'Unable to sync usage.'
          );
        })

        .finally(() => {

          setSyncing(false);
        });
    },
    [db]
  );

  const handleStop = useCallback(
    () => {

      if (!session) {
        return;
      }

      Alert.alert(
        'Stop timer?',
        'The elapsed time will be saved as manual usage.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Stop',
            onPress: () => {

              stopManualTimer(db)

                .then(() => {

                  load();
                })

                .catch((error) => {

                  console.error(
                    'Stop failed:',
                    error
                  );

                  Alert.alert(
                    'Unable to stop',
                    error instanceof Error
                      ? error.message
                      : 'Something went wrong.'
                  );
                });
            },
          },
        ]
      );
    },
    [db, load, session]
  );

  const installedCount =
    trackedApps.filter(
      (app) =>
        app.packageName !== null
    ).length;

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Text style={styles.title}>
          Usage
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Usage Access
          </Text>

          <Text
            style={[
              styles.status,
              usageAccessGranted
                ? styles.granted
                : styles.denied,
            ]}
          >
            {usageAccessGranted
              ? 'granted'
              : 'not granted'}
          </Text>

          <Text style={styles.secondary}>
            Android usage for installed apps is
            only available once Usage Access is
            enabled.
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => {

              permissionService.openUsageAccessSettings();

              setTimeout(
                () => {
                  setUsageAccessGranted(
                    permissionService.isUsageAccessGranted()
                  );
                },
                1000
              );
            }}
          >
            <Text style={styles.buttonText}>
              Open system settings
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Manual timer
          </Text>

          {
            session ? (
              <>
                <Text style={styles.bigNumber}>
                  {formatDuration(
                    elapsedSeconds
                  )}
                </Text>

                <Text style={styles.secondary}>
                  Running for{' '}
                  {
                    trackedApps.find(
                      (app) =>
                        app.id ===
                        session.trackedAppId
                    )?.appName ??
                    'an app'
                  }
                  .
                </Text>

                <Pressable
                  style={styles.dangerButton}
                  onPress={handleStop}
                >
                  <Text style={styles.dangerText}>
                    Stop timer
                  </Text>
                </Pressable>
              </>
            ) : (
              <Text style={styles.secondary}>
                No timer running. Start one from a
                tracked app card.
              </Text>
            )
          }
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Sync
          </Text>

          <Text style={styles.secondary}>
            {installedCount} installed{' '}
            {installedCount === 1
              ? 'app'
              : 'apps'}{' '}
            tracked.
            {lastSyncedAt
              ? ` Last synced at ${new Date(
                  lastSyncedAt
                ).toLocaleTimeString()}.`
              : ''}
          </Text>

          <Pressable
            style={styles.button}
            onPress={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.buttonText}>
                Sync Android usage
              </Text>
            )}
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  title: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
  },

  card: {
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  cardLabel: {
    color: '#64748B',
  },

  bigNumber: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
  },

  secondary: {
    marginTop: 8,
    lineHeight: 20,
    color: '#64748B',
  },

  status: {
    marginTop: 8,
    fontWeight: '800',
  },

  granted: {
    color: '#16A34A',
  },

  denied: {
    color: '#DC2626',
  },

  button: {
    minHeight: 48,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#208AEF',
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  dangerButton: {
    minHeight: 48,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#DC2626',
  },

  dangerText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});