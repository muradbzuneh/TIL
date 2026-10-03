import {
  useCallback,
  useEffect,
  useMemo,
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
  TextInput,
  View,
} from 'react-native';

import {
  useRouter,
} from 'expo-router';

import {
  useDatabase,
} from '@/db/useDatabase';

import {
  getTrackedApps,
} from '@/db/repositories';

import {
  addInstalledApp,
  addManualApp,
  limitInputToSeconds,
  manualAppSchema,
} from '@/feature/apps';

import type {
  InstalledAppOption,
  LimitInputForm,
} from '@/feature/apps';

import LimitForm from '@/feature/apps/components/LimitForm';

import AppConfirmation from '@/feature/apps/components/AppConfirmation';

import {
  installedAppsService,
} from '@/services/app';

export default function AddAppScreen() {

  const router =
    useRouter();

  const db =
    useDatabase();

  const [
    apps,
    setApps,
  ] =
    useState<
      InstalledAppOption[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    selectedApp,
    setSelectedApp,
  ] =
    useState<
      InstalledAppOption | null
    >(null);

  const [
    manualMode,
    setManualMode,
  ] =
    useState(false);

  const [
    manualEntry,
    setManualEntry,
  ] =
    useState(false);

  const [
    manualName,
    setManualName,
  ] =
    useState('');

  const [
    limit,
    setLimit,
  ] =
    useState<LimitInputForm | null>(
      null
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    search,
    setSearch,
  ] =
    useState('');

  const loadApps =
    useCallback(
      () => {

        return getTrackedApps(db)

          .then((tracked) => {

            const installed =
              installedAppsService.getInstalledApps();

            const alreadyTracked =
              new Set(
                tracked
                  .map(
                    (app) =>
                      app.packageName
                  )
                  .filter(
                    (
                      packageName
                    ): packageName is string =>
                      packageName !== null
                  )
              );

            setApps(
              installed
                .filter(
                  (app) =>
                    !alreadyTracked.has(
                      app.packageName
                    )
                )
                .map(
                  (app): InstalledAppOption => ({
                    packageName:
                      app.packageName,

                    appName:
                      app.appName,

                    iconUri: null,
                  })
                )
            );
          })

          .catch((error) => {

            console.error(
              'Failed to load installed apps:',
              error
            );

            Alert.alert(
              'Unable to load apps',
              'TIL could not read the installed app list. Make sure Usage Access is enabled.'
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

  const filteredApps =
    useMemo(
      () => {

        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return apps;
        }

        return apps.filter(
          (app) =>
            app.appName
              .toLowerCase()
              .includes(query)
        );
      },
      [apps, search]
    );

  async function handleSave() {

    if (!limit) {
      return;
    }

    const seconds =
      limitInputToSeconds(
        limit
      );

    try {

      setSaving(true);

      if (manualMode) {

        const name =
          manualName.trim();

        if (!name) {
          Alert.alert(
            'App name required',
            'Enter an app name first.'
          );

          return;
        }

        await addManualApp(
          db,
          {
            appName: name,
            dailyLimitSeconds:
              seconds,
          }
        );

      } else {

        if (!selectedApp) {
          return;
        }

        await addInstalledApp(
          db,
          {
            packageName:
              selectedApp.packageName,

            appName:
              selectedApp.appName,

            iconUri:
              selectedApp.iconUri,

            dailyLimitSeconds:
              seconds,
          }
        );
      }

      Alert.alert(
        'App added',
        'The daily limit has been saved.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.back(),
          },
        ]
      );

    } catch (error) {

      console.error(
        'Failed to save app:',
        error
      );

      Alert.alert(
        'Could not save app',
        error instanceof Error
          ? error.message
          : 'Something went wrong.'
      );

    } finally {

      setSaving(false);
    }
  }

  function handleLimitSubmit(
    value: LimitInputForm
  ) {
    setLimit(value);
  }

  function handleLimitCancel() {

    if (manualMode) {

      setManualMode(false);
      setManualEntry(true);

      return;
    }

    setSelectedApp(null);
  }

  if (limit) {

    const seconds =
      limitInputToSeconds(
        limit
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
              setLimit(null)
            }
          >
            <Text style={styles.back}>
              ← Back
            </Text>
          </Pressable>

          <AppConfirmation
            appName={
              manualMode
                ? manualName.trim()
                : selectedApp?.appName ??
                  ''
            }
            dailyLimitSeconds={
              seconds
            }
            source={
              manualMode
                ? 'manual'
                : 'installed'
            }
            onConfirm={
              handleSave
            }
            onCancel={() =>
              setLimit(null)
            }
            saving={saving}
          />

        </ScrollView>

      </SafeAreaView>
    );
  }

  if (selectedApp || manualMode) {

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
            onPress={handleLimitCancel}
          >
            <Text style={styles.back}>
              ← Choose another app
            </Text>
          </Pressable>

          <Text style={styles.title}>
            Set Daily Limit
          </Text>

          <Text style={styles.selectedName}>
            {manualMode
              ? manualName
              : selectedApp?.appName}
          </Text>

          <LimitForm
            onSubmit={
              handleLimitSubmit
            }
            onCancel={handleLimitCancel}
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

        <Pressable
          onPress={() =>
            router.back()
          }
        >
          <Text style={styles.back}>
            ← Back
          </Text>
        </Pressable>

        <Text style={styles.title}>
          Add App
        </Text>

        <Text style={styles.description}>
          Choose an installed app or add
          a manual app label.
        </Text>

        <Pressable
          style={
            styles.manualButton
          }
          onPress={() =>
            setManualEntry(true)
          }
        >
          <Text
            style={
              styles.manualButtonText
            }
          >
            + Add App Manually
          </Text>
        </Pressable>

        {manualEntry && (
          <View style={styles.manualBox}>

            <Text
              style={styles.fieldLabel}
            >
              App name
            </Text>

            <TextInput
              value={manualName}
              onChangeText={
                setManualName
              }
              placeholder="Example: YouTube"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
              maxLength={80}
            />

            <Pressable
              style={styles.continueButton}
              onPress={() => {

                const parsed =
                  manualAppSchema.safeParse(
                    {
                      appName:
                        manualName,
                    }
                  );

                if (
                  !parsed.success
                ) {
                  Alert.alert(
                    'Invalid app name',
                    parsed.error
                      .issues[0]
                      ?.message ??
                      'Enter an app name.'
                  );

                  return;
                }

                setManualMode(
                  true
                );

                setManualEntry(
                  false
                );

              }}
            >
              <Text
                style={
                  styles.continueText
                }
              >
                Continue
              </Text>
            </Pressable>

          </View>
        )}

        <Text style={styles.sectionTitle}>
          Installed Apps
        </Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search installed apps..."
          placeholderTextColor="#94A3B8"
          style={styles.search}
        />

        {loading ? (

          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading apps...
            </Text>
          </View>

        ) : (

          filteredApps.map(
            (app) => (

              <Pressable
                key={
                  app.packageName
                }
                style={styles.appRow}
                onPress={() =>
                  setSelectedApp(
                    app
                  )
                }
              >

                <View
                  style={
                    styles.appIcon
                  }
                >
                  <Text>
                    {app.appName
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>

                <View
                  style={
                    styles.appInfo
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
                    style={
                      styles.packageName
                    }
                  >
                    {app.packageName}
                  </Text>
                </View>

                <Text
                  style={
                    styles.chevron
                  }
                >
                  →
                </Text>

              </Pressable>
            )
          )
        )}

      </ScrollView>

    </SafeAreaView>
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
      fontSize: 15,
      fontWeight: '700',
      color: '#208AEF',
      marginBottom: 20,
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

    selectedName: {
      marginTop: 12,
      fontSize: 18,
      fontWeight: '700',
      color: '#208AEF',
      marginBottom: 24,
    },

    manualButton: {
      marginTop: 20,
      minHeight: 50,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#208AEF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    manualButtonText: {
      color: '#208AEF',
      fontWeight: '700',
    },

    manualBox: {
      marginTop: 12,
      padding: 16,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
    },

    fieldLabel: {
      marginBottom: 7,
      fontWeight: '700',
      color: '#334155',
    },

    textInput: {
      height: 48,
      borderWidth: 1,
      borderColor: '#CBD5E1',
      borderRadius: 12,
      paddingHorizontal: 14,
      color: '#0F172A',
      backgroundColor: '#FFFFFF',
    },

    continueButton: {
      marginTop: 12,
      height: 46,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#208AEF',
    },

    continueText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    sectionTitle: {
      marginTop: 28,
      marginBottom: 10,
      fontSize: 19,
      fontWeight: '800',
      color: '#0F172A',
    },

    search: {
      height: 48,
      borderWidth: 1,
      borderColor: '#CBD5E1',
      borderRadius: 12,
      paddingHorizontal: 14,
      color: '#0F172A',
      backgroundColor: '#FFFFFF',
    },

    loading: {
      paddingVertical: 40,
      alignItems: 'center',
    },

    loadingText: {
      marginTop: 10,
      color: '#64748B',
    },

    appRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      padding: 14,
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
    },

    appIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E0F2FE',
    },

    appInfo: {
      flex: 1,
      marginLeft: 12,
    },

    appName: {
      fontSize: 16,
      fontWeight: '700',
      color: '#0F172A',
    },

    packageName: {
      marginTop: 3,
      fontSize: 11,
      color: '#94A3B8',
    },

    chevron: {
      marginLeft: 10,
      fontSize: 20,
      color: '#64748B',
    },
  });