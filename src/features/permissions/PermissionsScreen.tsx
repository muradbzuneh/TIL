import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/components/Screen';
import {
  BodyText,
  Card,
} from '@/components/Card';
import {
  Button,
} from '@/components/Button';
import { Icon } from '@/components/Icon';
import {
  StackHeader,
} from '@/components/StackHeader';

import { useDatabase } from '@/database/useDatabase';
import {
  getTrackedApps,
  getActiveManualSession,
} from '@/database/repositories';

import type {
  ManualSession,
} from '@/database/repositories';

import { permissionService } from '@/services/permissions';

import { usePermissionsStore } from '@/stores/permissionsStore';
import { syncTodayUsage } from '@/services/usage/usageSyncService';

import {
  colors,
  radius,
  spacing,
} from '@/theme';

import { formatDuration } from '@/utils/time';

export default function PermissionsScreen() {

  const db = useDatabase();

  const status =
    usePermissionsStore(
      (state) => state.status
    );

  const refreshPermissions =
    usePermissionsStore(
      (state) => state.refresh
    );

  const [
    session,
    setSession,
  ] = useState<ManualSession | null>(
    null
  );

  const [
    installedCount,
    setInstalledCount,
  ] = useState(0);

  const [
    elapsed,
    setElapsed,
  ] = useState(0);

  const [
    syncing,
    setSyncing,
  ] = useState(false);

  const [
    lastSync,
    setLastSync,
  ] = useState<string | null>(
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

            setInstalledCount(
              apps.filter(
                (app) =>
                  app.packageName !== null
              ).length
            );

            setSession(active);
          })

          .catch((error) => {

            console.error(
              'Load failed:',
              error
            );
          });
      },
      [db]
    );

  useEffect(() => {

    refreshPermissions();

    load();
  }, [load, refreshPermissions]);

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

          setElapsed(
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

  const handleSync = () => {

    setSyncing(true);

    syncTodayUsage(db)

      .then((result) => {

        refreshPermissions();

        setLastSync(
          new Date(
            result.queriedAt
          ).toLocaleTimeString()
        );
      })

      .catch((error) => {

        console.error(
          'Sync failed:',
          error
        );
      })

      .finally(() => {

        setSyncing(false);
      });
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: 40,
        }}
      >
        <StackHeader
          title="Permissions"
          subtitle="Usage Access, overlay and syncing"
        />

        <Card>
          <PermissionRow
            icon="permission"
            title="Usage Access"
            description="Required to read how long you use each installed app."
            granted={status.usageAccess}
            onPress={() => {

              permissionService.openUsageAccessSettings();
            }}
          />
        </Card>

        <Card
          style={{
            marginTop: spacing.md,
          }}
        >
          <PermissionRow
            icon="reached"
            title="Overlay"
            description="Lets TIL show a blocking screen when an app hits its limit."
            granted={status.overlay}
            onPress={() => {

              permissionService.openOverlaySettings();
            }}
          />
        </Card>

        <Card
          style={{
            marginTop: spacing.md,
          }}
        >
          <PermissionRow
            icon="reached"
            title="App blocking"
            description="Turn on the TIL accessibility service so apps that hit their limit cannot be opened."
            granted={status.accessibility}
            onPress={() => {

              permissionService.openAccessibilitySettings();
            }}
          />
        </Card>

        <Card
          style={{
            marginTop: spacing.md,
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
              name="timer"
              size={18}
              color={colors.blue}
            />

            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.text,
              }}
            >
              Active timer
            </Text>
          </View>

          {
            session ? (
              <>
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: 28,
                    fontWeight: '800',
                    color: colors.text,
                  }}
                >
                  {formatDuration(elapsed)}
                </Text>

                <BodyText
                  text="Running. Elapsed time is added to that app's usage when you stop it in the Apps tab."
                />
              </>
            ) : (
              <BodyText
                text="No timer is running. Start one from a manual app card."
              />
            )
          }
        </Card>

        <Card
          style={{
            marginTop: spacing.md,
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
              name="usage"
              size={18}
              color={colors.blue}
            />

            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.text,
              }}
            >
              Usage sync
            </Text>
          </View>

          <BodyText
            text={`${installedCount} installed ${
              installedCount === 1
                ? 'app'
                : 'apps'
            } tracked.${
              lastSync
                ? ` Last synced at ${lastSync}.`
                : ''
            }`}
          />

          <Button
            label="Sync now"
            icon="refresh"
            loading={syncing}
            onPress={handleSync}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}

function PermissionRow({
  icon,
  title,
  description,
  granted,
  onPress,
}: {
  icon: 'permission' | 'reached';
  title: string;
  description: string;
  granted: boolean;
  onPress: () => void;
}) {

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed
          ? styles.pressed
          : null,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Icon
          name={icon}
          size={18}
          color={colors.blue}
        />

        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: colors.text,
          }}
        >
          {title}
        </Text>
      </View>

      <View
        style={[
          styles.badge,
          granted
            ? styles.badgeGranted
            : styles.badgeDenied,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            granted
              ? styles.textGranted
              : styles.textDenied,
          ]}
        >
          {granted
            ? 'granted'
            : 'not granted'}
        </Text>
      </View>

      <BodyText
        text={description}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginTop: 10,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: colors.blue,
          }}
        >
          Open system settings
        </Text>

        <Icon
          name="details"
          size={14}
          color={colors.blue}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({

  row: {
    paddingVertical: 4,
  },

  pressed: {
    opacity: 0.7,
  },

  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },

  badgeGranted: {
    backgroundColor: colors.successSoft,
  },

  badgeDenied: {
    backgroundColor: colors.dangerSoft,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  textGranted: {
    color: colors.success,
  },

  textDenied: {
    color: colors.danger,
  },
});
