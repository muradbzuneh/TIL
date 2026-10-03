import {
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
  useRouter,
} from 'expo-router';

import { permissionService } from '@/services/permission';

export default function UsageAccessStep() {

  const router =
    useRouter();

  const [
    granted,
    setGranted,
  ] =
    useState(false);

  const [
    checking,
    setChecking,
  ] =
    useState(true);

  useEffect(() => {

    const interval =
      setInterval(
        () => {

          const status =
            permissionService.getPermissionStatus();

          setGranted(
            status.usageAccess
          );

          setChecking(false);
        },
        1000
      );

    return () =>
      clearInterval(interval);
  }, []);

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Text style={styles.step}>
          Step 1 of 3
        </Text>

        <Text style={styles.title}>
          Usage Access
        </Text>

        <Text style={styles.body}>
          Android only reports app usage to apps that
          hold Usage Access. TIL reads those numbers so
          your limits stay accurate.
        </Text>

        <Text style={styles.body}>
          Without it you can still use manual timers,
          but installed-app usage will show as
          unverified.
        </Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>
            Status
          </Text>

          <Text
            style={[
              styles.statusValue,
              granted
                ? styles.granted
                : styles.denied,
            ]}
          >
            {checking ? (
              <ActivityIndicator />
            ) : granted ? (
              'granted'
            ) : (
              'not granted'
            )}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.button}
          onPress={() => {

            permissionService.openUsageAccessSettings();
          }}
        >
          <Text style={styles.buttonText}>
            Open Android settings
          </Text>
        </Pressable>

        <Pressable
          style={styles.linkButton}
          onPress={() =>
            router.push(
              '/onboarding/overlay'
            )
          }
        >
          <Text style={styles.linkText}>
            Skip for now
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },

  step: {
    color: '#208AEF',
    fontWeight: '700',
  },

  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },

  body: {
    marginTop: 14,
    lineHeight: 22,
    fontSize: 16,
    color: '#475569',
  },

  statusCard: {
    marginTop: 26,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  statusLabel: {
    color: '#64748B',
  },

  statusValue: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: '800',
  },

  granted: {
    color: '#16A34A',
  },

  denied: {
    color: '#DC2626',
  },

  footer: {
    padding: 24,
  },

  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#208AEF',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  linkButton: {
    minHeight: 48,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  linkText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '700',
  },
});