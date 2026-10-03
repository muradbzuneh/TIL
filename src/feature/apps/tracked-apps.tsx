import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';

import {
  useRouter,
} from 'expo-router';

import {
  useDatabase,
} from '@/db/useDatabase';

import {
  getTrackedApps,
  getDailyUsage,
  getActiveManualSession,
} from '@/db/repositories';

import type {
  ManualSession,
  TrackedApp,
} from '@/db/repositories';

import {
  getLocalDateKey,
} from '@/db/utils';

import {
  buildTrackedAppUsage,
} from '@/feature/limits/limitServices';

import {
  startManualTimer,
  stopManualTimer,
} from '@/feature/timer';

import {
  removeApp,
  updateAppLimit,
  secondsToLimitInput,
  limitInputToSeconds,
} from '@/feature/apps';

import type {
  LimitInputForm,
} from '@/feature/apps';

import LimitForm from '@/feature/apps/components/LimitForm';

import {
  formatDuration,
} from '@/utils/time';

import type {
  UsageStatus,
} from '@/types/usage';

export default function TrackedAppsScreen() {

  const router =
    useRouter();

  const db =
    useDatabase();

  const [
    apps,
    setApps,
  ] =
    useState<TrackedApp[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    editingApp,
    setEditingApp,
  ] =
    useState<TrackedApp | null>(
      null
    );

  const [
    activeSession,
    setActiveSession,
  ] =
    useState<
      ManualSession | null
    >(null);

  const loadApps =
    useCallback(
      () => {

        return Promise.all([
          getTrackedApps(db),
          getActiveManualSession(db),
        ])

          .then(([result, session]) => {

            setApps(result);

            setActiveSession(session);
          })

          .catch((error) => {

            console.error(
              'Failed to load tracked apps:',
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

    loadApps();

  }, [loadApps]);

  function handleStartTimer(
    app: TrackedApp
  ) {

    setLoading(true);

    startManualTimer(db, app.id)

      .then(() => {

        loadApps();
      })

      .catch((error) => {

        setLoading(false);

        Alert.alert(
          'Unable to start timer',
          error instanceof Error
            ? error.message
            : 'Something went wrong.'
        );
      });
  }

  function handleStopTimer() {

    if (!activeSession) {
      return;
    }

    Alert.alert(
      'Stop timer?',
      'The elapsed time is saved as manual usage.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Stop',
          onPress: () => {

            setLoading(true);

            stopManualTimer(db)

              .then(() => {

                loadApps();
              })

              .catch((error) => {

                setLoading(false);

                Alert.alert(
                  'Unable to stop timer',
                  error instanceof Error
                    ? error.message
                    : 'Something went wrong.'
                );
              });
          },
        },
      ]
    );
  }

  async function handleUpdateLimit(
    value: LimitInputForm
  ) {

    if (!editingApp) {
      return;
    }

    try {

      const seconds =
        limitInputToSeconds(
          value
        );

      await updateAppLimit(
        db,
        editingApp.id,
        seconds
      );

      setEditingApp(null);

      setLoading(true);

      await loadApps();

      Alert.alert(
        'Limit updated',
        'The daily limit has been updated.'
      );

    } catch (error) {

      Alert.alert(
        'Update failed',
        error instanceof Error
          ? error.message
          : 'Unable to update the limit.'
      );
    }
  }

  async function handleRemove(
    app: TrackedApp
  ) {

    try {

      const date =
        getLocalDateKey();

      const usage =
        await getDailyUsage(
          db,
          app.id,
          date
        );

      const calculated =
        buildTrackedAppUsage(
          app,
          usage
        );

      const isLocked =
        calculated.status ===
        'reached';

      if (isLocked) {

        Alert.alert(
          'App is locked',
          'This app has reached its daily limit. It cannot be removed until the daily reset.'
        );

        return;
      }

      Alert.alert(
        'Remove app?',
        `Remove ${app.appName} from TIL tracking?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {

              try {

                await removeApp(
                  db,
                  app,
                  isLocked
                );

                setLoading(true);

                await loadApps();

              } catch (error) {

                Alert.alert(
                  'Remove failed',
                  error instanceof Error
                    ? error.message
                    : 'Unable to remove app.'
                );
              }
            },
          },
        ]
      );

    } catch (error) {

      console.error(
        'Remove check failed:',
        error
      );

      Alert.alert(
        'Unable to remove',
        'TIL could not verify the current app status.'
      );
    }
  }

  if (editingApp) {

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
              setEditingApp(null)
            }
          >
            <Text style={styles.back}>
              ← Back
            </Text>
          </Pressable>

          <Text style={styles.title}>
            Edit Limit
          </Text>

          <Text style={styles.selectedApp}>
            {editingApp.appName}
          </Text>

          <LimitForm
            initialValue={
              secondsToLimitInput(
                editingApp.dailyLimitSeconds
              )
            }
            submitLabel="Save Changes"
            onSubmit={
              handleUpdateLimit
            }
            onCancel={() =>
              setEditingApp(null)
            }
          />

        </ScrollView>

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
          Tracked Apps
        </Text>

        <Text style={styles.description}>
          Manage the apps that TIL tracks
          and their daily limits.
        </Text>

        <Pressable
          style={styles.addButton}
          onPress={() =>
            router.push('/add-app')
          }
        >
          <Text style={styles.addText}>
            + Add App
          </Text>
        </Pressable>

        {loading ? (

          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
            />
          </View>

        ) : apps.length === 0 ? (

          <View style={styles.empty}>

            <Text style={styles.emptyTitle}>
              No tracked apps
            </Text>

            <Text style={styles.emptyText}>
              Add an app to start managing
              your screen-time budget.
            </Text>

          </View>

        ) : (

          apps.map(
            (app) => (

              <TrackedAppCard
                key={app.id}
                app={app}
                db={db}
                isTimerRunning={
                  activeSession
                    ? activeSession
                        .trackedAppId ===
                      app.id
                    : false
                }
                onEdit={() =>
                  setEditingApp(app)
                }
                onRemove={() =>
                  handleRemove(app)
                }
                onOpenDetails={() =>
                  router.push({
                    pathname:
                      '/app-details',
                    params: {
                      id: String(app.id),
                    },
                  })
                }
                onStartTimer={() =>
                  handleStartTimer(app)
                }
                onStopTimer={
                  handleStopTimer
                }
              />
            )
          )
        )}

      </ScrollView>

    </SafeAreaView>
  );
}

function TrackedAppCard({
  app,
  db,
  isTimerRunning,
  onEdit,
  onRemove,
  onOpenDetails,
  onStartTimer,
  onStopTimer,
}: {
  app: TrackedApp;
  db: ReturnType<
    typeof useDatabase
  >;
  isTimerRunning: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onOpenDetails: () => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
}) {

  const [
    status,
    setStatus,
  ] =
    useState<UsageStatus>(
      'unverified'
    );

  const [
    usedSeconds,
    setUsedSeconds,
  ] =
    useState(0);

  useEffect(() => {

    let mounted = true;

    async function loadStatus() {

      const date =
        getLocalDateKey();

      const usage =
        await getDailyUsage(
          db,
          app.id,
          date
        );

      const result =
        buildTrackedAppUsage(
          app,
          usage
        );

      if (mounted) {

        setStatus(
          result.status
        );

        setUsedSeconds(
          result.usedSeconds
        );
      }
    }

    loadStatus();

    return () => {
      mounted = false;
    };

  }, [
    db,
    app,
  ]);

  const locked =
    status === 'reached';

  return (
    <View style={styles.card}>

      <Pressable
        style={styles.cardHeader}
        onPress={onOpenDetails}
      >

        <View
          style={styles.icon}
        >
          <Text>
            {app.appName
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View
          style={styles.cardInfo}
        >

          <Text
            style={styles.appName}
          >
            {app.appName}
          </Text>

          <Text
            style={styles.source}
          >
            {app.source ===
            'installed'
              ? 'Installed app'
              : 'Manual app'}
          </Text>

        </View>

        <Text
          style={[
            styles.status,
            status ===
                'warning' &&
              styles.warning,
            status ===
                'reached' &&
              styles.reached,
            status ===
                'unverified' &&
              styles.unverified,
          ]}
        >
          {status}
        </Text>

        <Text style={styles.chevron}>
          ›
        </Text>

      </Pressable>

      <Text style={styles.used}>
        Used:{' '}
        {formatDuration(
          usedSeconds
        )}
      </Text>

      <Text style={styles.limit}>
        Daily limit:{' '}
        {formatDuration(
          app.dailyLimitSeconds
        )}
      </Text>

      {
        app.source === 'manual' && (
          <Pressable
            style={[
              styles.timerButton,
              isTimerRunning &&
                styles.timerButtonActive,
            ]}
            onPress={
              isTimerRunning
                ? onStopTimer
                : onStartTimer
            }
          >
            <Text
              style={[
                styles.timerText,
                isTimerRunning &&
                  styles.timerTextActive,
              ]}
            >
              {isTimerRunning
                ? 'Stop timer'
                : 'Start timer'}
            </Text>
          </Pressable>
        )
      }

      <View style={styles.actions}>

        <Pressable
          style={styles.editButton}
          onPress={onEdit}
        >
          <Text style={styles.editText}>
            Edit Limit
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.removeButton,
            locked &&
              styles.disabledButton,
          ]}
          disabled={locked}
          onPress={onRemove}
        >
          <Text
            style={[
              styles.removeText,
              locked &&
                styles.disabledText,
            ]}
          >
            {locked
              ? 'Locked'
              : 'Remove'}
          </Text>
        </Pressable>

      </View>

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: '#F5F7FA',
    },

    content: {
      padding: 18,
      paddingBottom: 50,
    },

    back: {
      marginBottom: 20,
      color: '#208AEF',
      fontWeight: '700',
    },

    title: {
      fontSize: 28,
      fontWeight: '800',
      color: '#0F172A',
    },

    description: {
      marginTop: 6,
      lineHeight: 20,
      color: '#64748B',
    },

    selectedApp: {
      marginTop: 10,
      marginBottom: 24,
      fontSize: 18,
      fontWeight: '700',
      color: '#208AEF',
    },

    addButton: {
      marginTop: 20,
      height: 50,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#208AEF',
    },

    addText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    loading: {
      padding: 40,
      alignItems: 'center',
    },

    empty: {
      marginTop: 30,
      padding: 24,
      alignItems: 'center',
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#0F172A',
    },

    emptyText: {
      marginTop: 8,
      textAlign: 'center',
      lineHeight: 20,
      color: '#64748B',
    },

    card: {
      marginTop: 12,
      padding: 16,
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
    },

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    chevron: {
      marginLeft: 8,
      fontSize: 22,
      color: '#94A3B8',
    },

    unverified: {
      color: '#64748B',
    },

    icon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E0F2FE',
    },

    cardInfo: {
      flex: 1,
      marginLeft: 12,
    },

    appName: {
      fontSize: 16,
      fontWeight: '800',
      color: '#0F172A',
    },

    source: {
      marginTop: 3,
      fontSize: 12,
      color: '#94A3B8',
    },

    status: {
      fontSize: 12,
      fontWeight: '800',
      color: '#334155',
    },

    warning: {
      color: '#D97706',
    },

    reached: {
      color: '#DC2626',
    },

    used: {
      marginTop: 16,
      color: '#475569',
    },

    limit: {
      marginTop: 5,
      color: '#475569',
    },

    actions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },

    timerButton: {
      minHeight: 44,
      marginTop: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: '#EDE9FE',
    },

    timerButtonActive: {
      backgroundColor: '#DC2626',
    },

    timerText: {
      color: '#6D28D9',
      fontWeight: '700',
    },

    timerTextActive: {
      color: '#FFFFFF',
    },

    editButton: {
      flex: 1,
      height: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E0F2FE',
    },

    editText: {
      color: '#0369A1',
      fontWeight: '700',
    },

    removeButton: {
      flex: 1,
      height: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FEE2E2',
    },

    removeText: {
      color: '#DC2626',
      fontWeight: '700',
    },

    disabledButton: {
      backgroundColor: '#E2E8F0',
    },

    disabledText: {
      color: '#64748B',
    },
  });