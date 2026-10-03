import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/components/Screen';
import {
  BodyText,
  Card,
  CardHeader,
} from '@/components/Card';
import {
  Button,
} from '@/components/Button';

import { useRouter } from 'expo-router';
import { Icon } from '@/components/Icon';
import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonList,
} from '@/components/Skeleton';
import {
  EmptyState,
  ErrorState,
} from '@/components/States';

import {
  useDatabase,
} from '@/database/useDatabase';

import { getSecondsUntilMidnight } from '@/database/utils';

import { buildDashboard } from './dashboardService';

import type {
  DashboardSummary,
  TrackedAppUsage,
} from '@/types/dashboard';

import type { UsageStatus } from '@/types/usage';

import {
  colors,
  radius,
  spacing,
} from '@/theme';

import {
  formatCountdown,
  formatDuration,
} from '@/utils/time';

export default function DashboardScreen() {

  const db = useDatabase();
  const router = useRouter();

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
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    resetSeconds,
    setResetSeconds,
  ] = useState(
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
      clearInterval(interval);
  }, []);

  if (loading && !dashboard) {
    return (
      <Screen>
        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: 40,
          }}
        >
          <SkeletonBlock
            width={120}
            height={11}
          />

          <SkeletonBlock
            width="45%"
            height={26}
            style={{
              marginTop: 10,
            }}
          />

          <SkeletonCard
            rows={4}
            style={{
              marginTop: spacing.md,
            }}
          />

          <SkeletonList />
        </ScrollView>
      </Screen>
    );
  }

  if (!dashboard) {
    return (
      <Screen>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: spacing.lg,
          }}
        >
          <ErrorState
            title="Couldn't load the dashboard"
            message={
              error ??
              'Your saved limits are safe.'
            }
            onRetry={refresh}
          />
        </View>
      </Screen>
    );
  }

  const usedApps =
    dashboard.apps.filter(
      (app) => app.usedSeconds > 0
    );

  const lockedApps =
    dashboard.apps.filter(
      (app) => app.isLocked
    );

  const globalStatus: UsageStatus =
    dashboard.usageAccessGranted
      ? dashboard.global.status
      : 'unverified';

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: 40,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: colors.blue,
            letterSpacing: 1,
          }}
        >
          {dashboard.date}
        </Text>

        <Text
          style={{
            marginTop: 4,
            fontSize: 30,
            fontWeight: '800',
            letterSpacing: -0.8,
            color: colors.text,
          }}
        >
          Today
        </Text>

        {
          !dashboard.usageAccessGranted && (
            <Card
              style={{
                marginTop: spacing.md,
                backgroundColor:
                  colors.warningSoft,
                borderColor:
                  'rgba(217,119,6,0.25)',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon
                  name="warning"
                  size={18}
                  color={colors.warning}
                />

                <Text
                  style={{
                    fontWeight: '700',
                    color: colors.warning,
                  }}
                >
                  Usage unverified
                </Text>
              </View>

              <BodyText
                text="Android usage stays at 0 until Usage Access is enabled. Grant it from Settings, then refresh."
                style={{
                  color: colors.warning,
                }}
              />
            </Card>
          )
        }

        <Card
          style={{
            marginTop: spacing.md,
            padding: spacing.lg,
          }}
        >
          <CardHeader
            icon={
              <Icon
                name="limit"
                size={16}
                color={colors.blue}
              />
            }
            title="Combined limit"
            trailing={
              <StatusPill
                status={globalStatus}
                locked={
                  dashboard.global.isReached
                }
              />
            }
          />

          <Text
            style={{
              marginTop: 14,
              fontSize: 34,
              fontWeight: '800',
              letterSpacing: -0.9,
              color: colors.text,
            }}
          >
            {formatDuration(
              dashboard.global.usedSeconds
            )}
          </Text>

          {
            dashboard.global.isEnabled ? (
              <View
                style={{
                  marginTop: spacing.sm,
                  gap: 4,
                }}
              >
                <MetricRow
                  label="Limit"
                  value={formatDuration(
                    dashboard.global
                      .dailyLimitSeconds
                  )}
                />

                <MetricRow
                  label="Remaining"
                  value={formatDuration(
                    dashboard.global
                      .remainingSeconds
                  )}
                />

                <MetricRow
                  label="Progress"
                  value={`${dashboard.global.progressPercent.toFixed(
                    1
                  )}%`}
                />
              </View>
            ) : (
              <BodyText
                text="No combined limit set. Add one from Settings."
              />
            )
          }
        </Card>

        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginTop: spacing.md,
          }}
        >
          <Tile
            icon="apps"
            label="Tracked"
            value={
              dashboard.trackedAppCount
            }
          />

          <Tile
            icon="usage"
            label="Used today"
            value={usedApps.length}
          />

          <Tile
            icon="reached"
            label="Locked"
            value={lockedApps.length}
          />
        </View>

        <Card
          style={{
            marginTop: spacing.md,
          }}
        >
          <CardHeader
            icon={
              <Icon
                name="timer"
                size={16}
                color={
                  dashboard
                    .activeManualTimerCount > 0
                    ? colors.blue
                    : colors.textMuted
                }
              />
            }
            title="Active timers"
            trailing={
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '800',
                  color: colors.text,
                }}
              >
                {
                  dashboard
                    .activeManualTimerCount
                }
              </Text>
            }
          />

          <BodyText
            text={
              dashboard
                .activeManualTimerCount === 0
                ? 'No manual timer is running. Start one from a manual app card in Apps.'
                : 'A manual timer is running. Its elapsed time is added to that app when you stop it.'
            }
          />
        </Card>

        <Card
          style={{
            marginTop: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <View
            style={{
              flex: 1,
            }}
          >
            <CardHeader
              title="Reset in"
            />

            <Text
              style={{
                marginTop: 8,
                fontSize: 26,
                fontWeight: '800',
                letterSpacing: -0.5,
                color: colors.text,
              }}
            >
              {formatCountdown(
                resetSeconds
              )}
            </Text>
          </View>

          <Icon
            name="refresh"
            size={26}
            color={
              colors.textMuted
            }
          />
        </Card>

        <Text
          style={{
            marginTop: spacing.xl,
            marginBottom: spacing.sm,
            fontSize: 18,
            fontWeight: '800',
            color: colors.text,
          }}
        >
          Tracked apps
        </Text>

        {
          dashboard.apps.length === 0 ? (
            <EmptyState
              actionLabel="Add an App"
              onAction={() => {

                router.push('/add-app');
              }}
            />
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

        <Button
          label="Refresh"
          variant="secondary"
          icon="refresh"
          loading={loading}
          onPress={refresh}
        />
      </ScrollView>
    </Screen>
  );
}

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          fontSize: 14,
          fontWeight: '700',
          color: colors.text,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function StatusPill({
  status,
  locked,
}: {
  status: UsageStatus;
  locked: boolean;
}) {

  const tone = statusTone(
    status,
    locked
  );

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: tone.bg },
      ]}
    >
      <Icon
        name={tone.icon}
        size={13}
        color={tone.fg}
      />

      <Text
        style={[
          styles.pillLabel,
          { color: tone.fg },
        ]}
      >
        {locked
          ? 'reached'
          : status}
      </Text>
    </View>
  );
}

function statusTone(
  status: UsageStatus,
  locked: boolean
) {

  if (locked) {
    return {
      bg: colors.lockedSoft,
      fg: colors.danger,
      icon: 'reached' as const,
    };
  }

  if (status === 'warning') {
    return {
      bg: colors.warningSoft,
      fg: colors.warning,
      icon: 'warning' as const,
    };
  }

  if (status === 'unverified') {
    return {
      bg: '#E2E8F0',
      fg: colors.textSecondary,
      icon: 'warning' as const,
    };
  }

  return {
    bg: colors.successSoft,
    fg: colors.success,
    icon: 'limit' as const,
  };
}

function Tile({
  icon,
  label,
  value,
}: {
  icon: 'apps' | 'usage' | 'reached';
  label: string;
  value: number;
}) {

  return (
    <View
      style={styles.tile}
    >
      <Icon
        name={icon}
        size={18}
        color={colors.blue}
      />

      <Text
        style={{
          marginTop: 8,
          fontSize: 22,
          fontWeight: '800',
          color: colors.text,
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          marginTop: 2,
          fontSize: 12,
          color: colors.textMuted,
        }}
      >
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
    <Card
      style={{
        marginBottom: 10,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: radius.sm,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              colors.infoSoft,
          }}
        >
          <Text
            style={{
              fontWeight: '800',
              color: colors.blue,
            }}
          >
            {app.appName
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <Text
          style={{
            flex: 1,
            fontSize: 16,
            fontWeight: '700',
            color: colors.text,
          }}
        >
          {app.appName}
        </Text>

        <StatusPill
          status={app.status}
          locked={app.isLocked}
        />
      </View>

      <View
        style={{
          marginTop: 12,
          gap: 3,
        }}
      >
        <MetricRow
          label="Used"
          value={formatDuration(
            app.usedSeconds
          )}
        />

        {
          app.isLimitEnabled ? (
            <>
              <MetricRow
                label="Limit"
                value={formatDuration(
                  app.dailyLimitSeconds
                )}
              />

              <MetricRow
                label="Remaining"
                value={formatDuration(
                  app.remainingSeconds
                )}
              />
            </>
          ) : null
        }
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  pillLabel: {
    fontSize: 11,
    fontWeight: '700',
  },

  tile: {
    flex: 1,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor:
      colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
