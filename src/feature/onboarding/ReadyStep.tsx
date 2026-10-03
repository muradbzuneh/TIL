import {
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

import { useDatabase } from '@/db/useDatabase';
import { completeOnboarding } from '@/db/repositories';

import { APP_NAME } from '@/constants/app';

export default function ReadyStep() {

  const db =
    useDatabase();

  const router =
    useRouter();

  const [
    busy,
    setBusy,
  ] =
    useState(false);

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
          Step 3 of 3
        </Text>

        <Text style={styles.title}>
          You&apos;re ready
        </Text>

        <Text style={styles.body}>
          {APP_NAME} is set up. Add the apps you want
          to watch, give each one a daily limit, and
          TIL takes care of the rest.
        </Text>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>
            Good to know
          </Text>

          <Text style={styles.tipText}>
            Usage resets automatically at midnight.
            Everything stays on this device.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.button}
          disabled={busy}
          onPress={() => {

            setBusy(true);

            completeOnboarding(db)

              .then(() => {

                router.replace(
                  '/(tabs)/dashboard'
                );
              })

              .catch((error) => {

                console.error(
                  'Onboarding failed:',
                  error
                );

                setBusy(false);
              });
          }}
        >
          {busy ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.buttonText}>
              Open {APP_NAME}
            </Text>
          )}
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

  tipCard: {
    marginTop: 26,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  tipTitle: {
    fontWeight: '800',
    color: '#0F172A',
  },

  tipText: {
    marginTop: 8,
    lineHeight: 20,
    color: '#64748B',
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
});