import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  useDatabase,
} from '@/database/useDatabase';

import {
  getTrackedAppById,
  getRecentDailyUsage,
} from '@/database/repositories';

import type {
  DailyUsage,
  TrackedApp,
} from '@/database/repositories';

import {
  getLocalDateKey,
} from '@/database/utils';

import {
  buildTrackedAppUsage,
} from '@/features/limits/limitServices';

import {
  formatDuration,
} from '@/utils/time';

export default function AppDetailsScreen() {

  const db =
    useDatabase();

  const router =
    useRouter();

  const {
    id,
  } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [
    app,
    setApp,
  ] =
    useState<TrackedApp | null>(
      null
    );

  const [
    history,
    setHistory,
  ] =
    useState<DailyUsage[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const appId =
    Number(id);

  const load =
    useCallback(
      () => {

        return Promise.resolve()

          .then(() => {

            if (
              !Number.isFinite(appId)
            ) {
              throw new Error(
                'This app could not be found.'
              );
            }
          })

          .then(() =>

            getTrackedAppById(
              db,
              appId
            )

              .then((result) => {

                if (!result) {
                  throw new Error(
                    'This app is no longer tracked.'
                  );
                }

                setApp(result);

                return getRecentDailyUsage(
                  db,
                  appId
                ).then(
                  (rows) => {

                    setHistory(rows);
                  }
                );
              })
          )

          .catch((err) => {

            console.error(
              'App details failed:',
              err
            );

            setError(
              err instanceof Error
                ? err.message
                : 'Unable to load app details.'
            );
          })

          .finally(() => {

            setLoading(false);
          });
      },
      [db, appId]
    );

  useEffect(() => {

    load();

  }, [load]);

  if (loading) {
    return (
      <SafeAreaView
        style={styles.center}
      >
        <ActivityIndicator
          size="large"
        />
      </SafeAreaView>
    );
  }

  if (
    !app ||
    error
  ) {
    return (
      <SafeAreaView
        style={styles.center}
      >
        <Text style={styles.errorText}>
          {error ??
            'This app could not be found.'}
        </Text>
      </SafeAreaView>
    );
  }

  const today =
    getLocalDateKey();

  const usage =
    buildTrackedAppUsage(
      app,
      history.find(
        (row) =>
          row.date === today
      ) ??
        null
    );

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Pressable
          onPress={() =>
            router.back()
          }
        >
          <Text style={styles.back}>
            ← Back
          </Text>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>
              {app.appName
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.title}>
              {app.appName}
            </Text>

            <Text style={styles.subtitle}>
              {app.source ===
              'installed'
                ? 'Installed app'
                : 'Manual app'}
            </Text>

            {
              app.packageName && (
                <Text style={styles.package}>
                  {app.packageName}
                </Text>
              )
            }
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>
              Today
            </Text>

            <Text
              style={[
                styles.status,
                usage.isLocked &&
                  styles.reached,
                usage.status ===
                    'warning' &&
                  styles.warning,
                usage.status ===
                    'unverified' &&
                  styles.unverified,
              ]}
            >
              {usage.isLocked
                ? 'locked'
                : usage.status}
            </Text>
          </View>

          <Text style={styles.bigNumber}>
            {formatDuration(
              usage.usedSeconds
            )}
          </Text>

          {
            usage.isLimitEnabled ? (
              <>
                <Text style={styles.secondary}>
                  Limit:{' '}
                  {formatDuration(
                    usage.dailyLimitSeconds
                  )}
                </Text>

                <Text style={styles.secondary}>
                  Remaining:{' '}
                  {formatDuration(
                    usage.remainingSeconds
                  )}
                </Text>

                <Text style={styles.secondary}>
                  Progress:{' '}
                  {usage.progressPercent
                    .toFixed(1)}
                  %
                </Text>
              </>
            ) : (
              <Text style={styles.secondary}>
                No daily limit is set for this app.
              </Text>
            )
          }

          <Text style={styles.sourceNote}>
            {app.source ===
            'installed'
              ? 'Usage comes from Android UsageStats.'
              : 'Usage comes from the manual timer.'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Last 7 days
        </Text>

        {
          history.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.secondary}>
                No usage recorded yet.
              </Text>
            </View>
          ) : (
            history.map(
              (row) => (
                <View
                  key={row.id}
                  style={styles.historyRow}
                >
                  <Text style={styles.historyDate}>
                    {row.date}
                  </Text>

                  <Text style={styles.historyValue}>
                    {formatDuration(
                      row.totalUsageSeconds
                    )}
                  </Text>
                </View>
              )
            )
          )
        }

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
    padding: 18,
    paddingBottom: 50,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  back: {
    fontSize: 15,
    fontWeight: '700',
    color: '#208AEF',
    marginBottom: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
  },

  iconText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0369A1',
  },

  headerInfo: {
    flex: 1,
    marginLeft: 14,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#64748B',
  },

  package: {
    marginTop: 2,
    fontSize: 11,
    color: '#94A3B8',
  },

  card: {
    marginTop: 18,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardLabel: {
    color: '#64748B',
  },

  bigNumber: {
    marginTop: 10,
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
  },

  secondary: {
    marginTop: 5,
    color: '#475569',
  },

  sourceNote: {
    marginTop: 14,
    fontSize: 12,
    color: '#94A3B8',
  },

  status: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },

  reached: {
    color: '#DC2626',
  },

  warning: {
    color: '#D97706',
  },

  unverified: {
    color: '#64748B',
  },

  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },

  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  historyDate: {
    color: '#475569',
  },

  historyValue: {
    fontWeight: '700',
    color: '#0F172A',
  },
});