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
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  useDatabase,
} from '@/db/useDatabase';

import {
  getGlobalSettings,
} from '@/db/repositories';

import type {
  GlobalSettings,
} from '@/db/repositories';

import {
  deleteAllLocalData,
  resetUsageData,
} from '@/db/operations';

import {
  permissionService,
} from '@/services/permission';

import {
  disableGlobalLimit,
  setGlobalLimit,
} from '@/feature/limits/globalLimitService';

import { formatDuration } from '@/utils/time';

import { APP_NAME, APP_VERSION } from '@/constants/app';

type PermissionState = {
  usageAccess: boolean;
  overlay: boolean;
};

export default function SettingsScreen() {

  const db =
    useDatabase();

  const [
    permissions,
    setPermissions,
  ] =
    useState<PermissionState>(
      () =>
        permissionService.getPermissionStatus()
    );

  const [
    settings,
    setSettings,
  ] =
    useState<
      GlobalSettings | null
    >(null);

  const [
    limitInput,
    setLimitInput,
  ] =
    useState('');

  const [
    savingLimit,
    setSavingLimit,
  ] =
    useState(false);

  const [
    busy,
    setBusy,
  ] =
    useState(false);

  const load =
    useCallback(
      () => {

        return getGlobalSettings(db)

          .then((result) => {

            setSettings(result);

            setPermissions(
              permissionService.getPermissionStatus()
            );

            if (result.isEnabled) {
              setLimitInput(
                String(
                  Math.round(
                    result.dailyLimitSeconds / 3600
                  )
                )
              );
            }
          })

          .catch((error) => {

            console.error(
              'Settings load failed:',
              error
            );
          });
      },
      [db]
    );

  useEffect(() => {

    load();

  }, [load]);

  const refreshPermissions =
    () => {

      setPermissions(
        permissionService.getPermissionStatus()
      );
    };

  const handleToggleGlobal =
    (enabled: boolean) => {

      if (!settings) {
        return;
      }

      setSavingLimit(true);

      const action = enabled
        ? setGlobalLimit(
            db,
            Number(
              limitInput || '0'
            ) * 3600
          )
        : disableGlobalLimit(db);

      action

        .then(() => {

          setSettings((previous) =>
            previous
              ? {
                  ...previous,
                  isEnabled: enabled,
                  dailyLimitSeconds:
                    enabled
                      ? Number(
                          limitInput || '0'
                        ) * 3600
                      : previous
                          .dailyLimitSeconds,
                }
              : previous
          );

          if (!enabled) {
            setLimitInput('');
          }
        })

        .catch((error) => {

          Alert.alert(
            'Could not update limit',
            error instanceof Error
              ? error.message
              : 'Something went wrong.'
          );
        })

        .finally(() => {

          setSavingLimit(false);
        });
    };

  const handleSaveGlobal =
    () => {

      const hours =
        Number(limitInput);

      if (
        !Number.isFinite(hours) ||
        hours <= 0
      ) {
        Alert.alert(
          'Invalid limit',
          'Enter how many hours the combined limit should be.'
        );

        return;
      }

      setSavingLimit(true);

      setGlobalLimit(db, hours * 3600)

        .then(() => {

          setSettings((previous) =>
            previous
              ? {
                  ...previous,
                  isEnabled: true,
                  dailyLimitSeconds:
                    hours * 3600,
                }
              : previous
          );
        })

        .catch((error) => {

          Alert.alert(
            'Could not update limit',
            error instanceof Error
              ? error.message
              : 'Something went wrong.'
          );
        })

        .finally(() => {

          setSavingLimit(false);
        });
    };

  const handleResetData = () => {

    Alert.alert(
      'Reset usage data?',
      'All recorded usage and manual sessions are deleted. Your tracked apps and limits stay.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {

            setBusy(true);

            resetUsageData(db)

              .then(load)

              .catch((error) => {

                Alert.alert(
                  'Reset failed',
                  error instanceof Error
                    ? error.message
                    : 'Unable to reset data.'
                );
              })

              .finally(() => {

                setBusy(false);
              });
          },
        },
      ]
    );
  };

  const handleDeleteAll = () => {

    Alert.alert(
      'Delete all local data?',
      'This removes every tracked app, all usage and the global limit. It cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () => {

            setBusy(true);

            deleteAllLocalData(db)

              .then(load)

              .catch((error) => {

                Alert.alert(
                  'Delete failed',
                  error instanceof Error
                    ? error.message
                    : 'Unable to delete data.'
                );
              })

              .finally(() => {

                setBusy(false);
              });
          },
        },
      ]
    );
  };

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
          Settings
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Permissions
          </Text>

          <PermissionRow
            label="Usage Access"
            granted={
              permissions.usageAccess
            }
            onPress={() => {

              permissionService.openUsageAccessSettings();

              setTimeout(
                refreshPermissions,
                1000
              );
            }}
          />

          <PermissionRow
            label="Overlay"
            granted={
              permissions.overlay
            }
            onPress={() => {

              permissionService.openOverlaySettings();

              setTimeout(
                refreshPermissions,
                1000
              );
            }}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Global limit
          </Text>

          <Text style={styles.secondary}>
            Applies across every tracked app for
            each day.
          </Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {settings?.isEnabled
                ? 'Enabled'
                : 'Disabled'}
            </Text>

            {
              savingLimit ? (
                <ActivityIndicator />
              ) : (
                <Switch
                  value={
                    settings?.isEnabled ??
                    false
                  }
                  onValueChange={
                    handleToggleGlobal
                  }
                />
              )
            }
          </View>

          {
            settings?.isEnabled && (
              <>
                <View style={styles.inputRow}>
                  <TextInput
                    value={limitInput}
                    onChangeText={
                      setLimitInput
                    }
                    keyboardType="number-pad"
                    style={styles.input}
                    placeholder="Hours"
                  />

                  <Pressable
                    style={styles.saveButton}
                    onPress={handleSaveGlobal}
                    disabled={savingLimit}
                  >
                    <Text style={styles.saveText}>
                      Save
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.secondary}>
                  Current limit:{' '}
                  {formatDuration(
                    settings.dailyLimitSeconds
                  )}
                  .
                </Text>
              </>
            )
          }
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Privacy
          </Text>

          <Text style={styles.secondary}>
            TIL keeps everything on this device.
            Usage figures are read from Android
            UsageStats and stored only in a local
            SQLite database. There is no account,
            no server and no analytics. Deleting
            all local data below removes
            everything permanently.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            About TIL
          </Text>

          <Text style={styles.secondary}>
            {APP_NAME} {APP_VERSION}
          </Text>

          <Text style={styles.secondary}>
            A local-only screen-time tracker. It reads
            Android usage with Usage Access, keeps your
            limits and history in a SQLite database on
            this device, and never sends anything
            anywhere.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Data
          </Text>

          <Pressable
            style={styles.button}
            onPress={handleResetData}
            disabled={busy}
          >
            <Text style={styles.buttonText}>
              Reset usage data
            </Text>
          </Pressable>

          <Pressable
            style={styles.dangerButton}
            onPress={handleDeleteAll}
            disabled={busy}
          >
            <Text style={styles.dangerText}>
              Delete all local data
            </Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function PermissionRow({
  label,
  granted,
  onPress,
}: {
  label: string;
  granted: boolean;
  onPress: () => void;
}) {

  return (
    <Pressable
      style={styles.permissionRow}
      onPress={onPress}
    >
      <Text style={styles.permissionLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.permissionStatus,
          granted
            ? styles.granted
            : styles.denied,
        ]}
      >
        {granted
          ? 'granted'
          : 'not granted'}
      </Text>
    </Pressable>
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

  secondary: {
    marginTop: 8,
    lineHeight: 20,
    color: '#64748B',
  },

  permissionRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  permissionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  permissionStatus: {
    fontSize: 13,
    fontWeight: '800',
  },

  granted: {
    color: '#16A34A',
  },

  denied: {
    color: '#DC2626',
  },

  switchRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  switchLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  inputRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },

  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#0F172A',
  },

  saveButton: {
    height: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#208AEF',
  },

  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  button: {
    minHeight: 48,
    marginTop: 14,
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
    marginTop: 10,
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