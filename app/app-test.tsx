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
  buildDashboard,
} from '@/feature/dashboard';

import type {
  DashboardSummary,
} from '@/types/dashboard';

import {
  formatCountdown,
  formatDuration,
} from '@/utils/time';

import {
  getSecondsUntilMidnight,
} from '@/db/utils';

export default function BusinessTestScreen() {

  const db =
    useDatabase();

  const [
    dashboard,
    setDashboard,
  ] =
    useState<DashboardSummary | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    resetSeconds,
    setResetSeconds,
  ] =
    useState(
      getSecondsUntilMidnight()
    );

  const loadDashboard =
    useCallback(
      () => {

        return buildDashboard(
          db
        )

          .then((result) => {

            setDashboard(
              result
            );
          })

          .catch((error) => {

            console.error(
              'Dashboard build failed:',
              error
            );
          })

          .finally(() => {

            setLoading(false);
          });
      },
      [db]
    );

  useEffect(() => {

    loadDashboard();

  }, [loadDashboard]);

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

  if (loading && !dashboard) {

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

        <Text>
          Unable to load dashboard.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => {

            setLoading(true);

            loadDashboard();
          }}
        >
          <Text style={styles.buttonText}>
            Retry
          </Text>
        </Pressable>

      </SafeAreaView>
    );
  }

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
          TIL Business Test
        </Text>

        <Text style={styles.date}>
          {dashboard.date}
        </Text>

        <View style={styles.resetCard}>

          <Text style={styles.cardLabel}>
            Daily Reset
          </Text>

          <Text style={styles.resetValue}>
            {formatCountdown(
              resetSeconds
            )}
          </Text>

        </View>

        <View style={styles.globalCard}>

          <Text style={styles.cardTitle}>
            Combined Limit
          </Text>

          <Text style={styles.bigNumber}>
            {formatDuration(
              dashboard.global.usedSeconds
            )}
          </Text>

          {dashboard.global.isEnabled ? (

            <>
              <Text style={styles.secondary}>
                of{' '}
                {formatDuration(
                  dashboard.global
                    .dailyLimitSeconds
                )}
              </Text>

              <Text style={styles.secondary}>
                Remaining:{' '}
                {formatDuration(
                  dashboard.global
                    .remainingSeconds
                )}
              </Text>

              <Text style={styles.secondary}>
                Progress:{' '}
                {dashboard.global
                  .progressPercent
                  .toFixed(1)}
                %
              </Text>

              <Text style={styles.status}>
                Status:{' '}
                {dashboard.global.status}
              </Text>
            </>

          ) : (

            <Text style={styles.secondary}>
              Global limit disabled
            </Text>
          )}

        </View>

        <Text style={styles.sectionTitle}>
          Tracked Apps
        </Text>

        {dashboard.apps.map(
          (app) => (

            <View
              key={app.id}
              style={styles.appCard}
            >

              <View
                style={
                  styles.appHeader
                }
              >

                <Text
                  style={
                    styles.appName
                  }
                >
                  {app.appName}
                </Text>

                <Text
                  style={[
                    styles.status,
                    app.status ===
                      'reached' &&
                      styles.reached,
                    app.status ===
                      'warning' &&
                      styles.warning,
                  ]}
                >
                  {app.status}
                </Text>

              </View>

              <Text
                style={
                  styles.secondary
                }
              >
                Used:{' '}
                {formatDuration(
                  app.usedSeconds
                )}
              </Text>

              {app.isLimitEnabled && (
                <>
                  <Text
                    style={
                      styles.secondary
                    }
                  >
                    Limit:{' '}
                    {formatDuration(
                      app.dailyLimitSeconds
                    )}
                  </Text>

                  <Text
                    style={
                      styles.secondary
                    }
                  >
                    Remaining:{' '}
                    {formatDuration(
                      app.remainingSeconds
                    )}
                  </Text>

                  <Text
                    style={
                      styles.secondary
                    }
                  >
                    Progress:{' '}
                    {app.progressPercent
                      .toFixed(1)}
                    %
                  </Text>
                </>
              )}

              <Text
                style={
                  styles.secondary
                }
              >
                Source:{' '}
                {app.source}
              </Text>

              <Text
                style={
                  styles.secondary
                }
              >
                Usage data:{' '}
                {app.hasUsageData
                  ? 'available'
                  : 'not available'}
              </Text>

            </View>
          )
        )}

        <View style={styles.infoCard}>

          <Text style={styles.secondary}>
            Tracked apps:{' '}
            {dashboard.trackedAppCount}
          </Text>

          <Text style={styles.secondary}>
            Active manual timers:{' '}
            {dashboard
              .activeManualTimerCount}
          </Text>

          <Text style={styles.secondary}>
            Usage Access:{' '}
            {dashboard
              .usageAccessGranted
              ? 'granted'
              : 'not granted'}
          </Text>

        </View>

        <Pressable
          style={styles.button}
          onPress={() => {

            setLoading(true);

            loadDashboard();
          }}
        >

          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.buttonText
              }
            >
              Refresh Dashboard
            </Text>
          )}

        </Pressable>

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

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#64748B',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
  },

  date: {
    marginTop: 4,
    color: '#64748B',
  },

  resetCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  cardLabel: {
    color: '#64748B',
  },

  resetValue: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: '800',
  },

  globalCard: {
    marginTop: 12,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  bigNumber: {
    marginTop: 12,
    fontSize: 30,
    fontWeight: '800',
  },

  secondary: {
    marginTop: 5,
    color: '#64748B',
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

  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 19,
    fontWeight: '800',
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
  },

  infoCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
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