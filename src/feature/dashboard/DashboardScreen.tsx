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
  useDatabase,
} from '@/db/useDatabase';

import {
  getSecondsUntilMidnight,
} from '@/db/utils';

import { buildDashboard } from './dashboardService';

import type {
  DashboardSummary,
  TrackedAppUsage,
} from '@/types/dashboard';

import {
  formatCountdown,
  formatDuration,
} from '@/utils/time';

export default function DashboardScreen() {

  const db =
    useDatabase();

  const [
    dashboard,
    setDashboard,
  ] =
    useState<
      DashboardSummary | null
    >(null);

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

  const [
    resetSeconds,
    setResetSeconds,
  ] =
    useState(
      getSecondsUntilMidnight()
    );

  const load =
    useCallback(
      () =>

        buildDashboard(db)

          .then((result) => {

            setError(null);

            setDashboard(result);
          })

          .catch((err) => {

            console.error(
              'Dashboard error:',
              err
            );

            setError(
              err instanceof Error
                ? err.message
                : 'Unable to load the dashboard.'
            );
          })

          .finally(() => {

            setLoading(false);
          }),
      [db]
    );

  const refresh =
    useCallback(
      () => {

        setLoading(true);

        return load();
      },
      [load]
    );

  useEffect(() => {

    load();

  }, [load]);

  useEffect(() => {

    const interval =
      setInterval(
        () => {

          setResetSeconds(
            getSecondsUntilMidnight()
          );
        },
        1000
      );

    return () =>
      clearInterval(
        interval
      );

  }, []);

  if (
    loading &&
    !dashboard
  ) {
    return (
      <SafeAreaView
        style={styles.center}
      >
        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Loading TIL...
        </Text>
      </SafeAreaView>
    );
  }

  if (!dashboard) {
    return (
      <SafeAreaView
        style={styles.center}
      >
        <Text style={styles.errorText}>
          {error ??
            'Unable to load the dashboard.'}
        </Text>

        <Pressable
          style={styles.button}
          onPress={refresh}
        >
          <Text style={styles.buttonText}>
            Retry
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const trackedApps =
    dashboard.apps.filter(
      (app) =>
        app.isLimitEnabled
    );

  const usedApps =
    trackedApps.filter(
      (app) =>
        app.usedSeconds > 0
    );

  const lockedApps =
    trackedApps.filter(
      (app) => app.isLocked
    );

  /*
   * Android usage cannot be trusted while
   * Usage Access is off, so the combined limit
   * reports "unverified" instead of "normal".
   */
  const globalStatus =
    dashboard.usageAccessGranted
      ? dashboard.global.status
      : 'unverified';

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            TIL
          </Text>

          <Text style={styles.date}>
            {dashboard.date}
          </Text>
        </View>

        {
          !dashboard.usageAccessGranted && (
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>
                Usage access is off
              </Text>

              <Text style={styles.warningText}>
                Android usage stays at 0 until you
                enable Usage Access in system settings.
              </Text>
            </View>
          )
        }

        {
          error && (
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                {error}
              </Text>
            </View>
          )
        }

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Combined limit
          </Text>

          <Text style={styles.bigNumber}>
            {formatDuration(
              dashboard.global.usedSeconds
            )}
          </Text>

          {
            dashboard.global.isEnabled ? (
              <>
                <Text style={styles.secondary}>
                  of{' '}
                  {formatDuration(
                    dashboard.global.dailyLimitSeconds
                  )}
                </Text>

                <Text style={styles.secondary}>
                  Remaining:{' '}
                  {formatDuration(
                    dashboard.global.remainingSeconds
                  )}
                </Text>

                <Text style={styles.secondary}>
                  Progress:{' '}
                  {dashboard.global
                    .progressPercent
                    .toFixed(1)}
                  %
                </Text>

                <Text style={[
            styles.status,
            globalStatus ===
                'reached' &&
              styles.reached,
            globalStatus ===
                'warning' &&
              styles.warning,
            globalStatus ===
                'unverified' &&
              styles.unverified,
          ]}
        >
          Status:{' '}
          {globalStatus}
        </Text>
              </>
            ) : (
              <Text style={styles.secondary}>
                No combined limit is set.
              </Text>
            )
          }
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Reset in
          </Text>

          <Text style={styles.countdown}>
            {formatCountdown(
              resetSeconds
            )}
          </Text>

          <Text style={styles.secondary}>
            Usage resets automatically at
            midnight, so each day starts at zero.
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <SummaryTile
            label="Tracked"
            value={
              dashboard.trackedAppCount
            }
          />

          <SummaryTile
            label="Used today"
            value={
              usedApps.length
            }
          />

          <SummaryTile
            label="Locked"
            value={
              lockedApps.length
            }
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>
              Active timers
            </Text>

            <Text style={styles.timerCount}>
              {dashboard.activeManualTimerCount}
            </Text>
          </View>

          {
            dashboard
              .activeManualTimerCount === 0 ? (
              <Text style={styles.secondary}>
                No manual timer is running. Start one
                from a manual app card in Apps.
              </Text>
            ) : (
              <Text style={styles.secondary}>
                A manual timer is running. Elapsed time
                is added to that app&apos;s usage when
                you stop it.
              </Text>
            )
          }
        </View>

        <Text style={styles.sectionTitle}>
          Tracked apps
        </Text>

        {
          dashboard.apps.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                No tracked apps
              </Text>

              <Text style={styles.emptyText}>
                Add an app to start managing your
                screen-time budget.
              </Text>
            </View>
          ) : (
            dashboard.apps.map(
              (app) => (
                <AppRow
                  key={app.id}
                  app={app}
                />
              )
            )
          )
        }

        <Pressable
          style={styles.button}
          onPress={refresh}
        >
          {
            loading ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.buttonText}>
                Refresh
              </Text>
            )
          }
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryTile({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>
        {value}
      </Text>

      <Text style={styles.tileLabel}>
        {label}
      </Text>
    </View>
  );
}

function AppRow({
  app,
}: {
  app: TrackedAppUsage;
}) {

  return (
    <View style={styles.appCard}>
      <View style={styles.appHeader}>
        <Text style={styles.appName}>
          {app.appName}
        </Text>

        <Text
          style={[
            styles.status,
            app.isLocked &&
              styles.reached,
            app.status ===
                'warning' &&
              styles.warning,
            app.status ===
                'unverified' &&
              styles.unverified,
          ]}
        >
          {app.isLocked
            ? 'locked'
            : app.status}
        </Text>
      </View>

      <Text style={styles.secondary}>
        Used:{' '}
        {formatDuration(
          app.usedSeconds
        )}
      </Text>

      {
        app.isLimitEnabled && (
          <>
            <Text style={styles.secondary}>
              Limit:{' '}
              {formatDuration(
                app.dailyLimitSeconds
              )}
            </Text>

            <Text style={styles.secondary}>
              Remaining:{' '}
              {formatDuration(
                app.remainingSeconds
              )}
            </Text>
          </>
        )
      }
    </View>
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

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#64748B',
  },

  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  header: {
    marginTop: 8,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
  },

  date: {
    marginTop: 4,
    color: '#64748B',
  },

  warningCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
  },

  warningTitle: {
    fontWeight: '800',
    color: '#92400E',
  },

  warningText: {
    marginTop: 6,
    lineHeight: 20,
    color: '#92400E',
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
    marginTop: 10,
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
  },

  countdown: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },

  secondary: {
    marginTop: 5,
    color: '#475569',
  },

  status: {
    marginTop: 8,
    fontWeight: '700',
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

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  timerCount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  tile: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },

  tileValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },

  tileLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748B',
  },

  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },

  emptyCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },

  emptyText: {
    marginTop: 6,
    lineHeight: 20,
    color: '#64748B',
  },

  appCard: {
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  appName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },

  button: {
    minHeight: 50,
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
});