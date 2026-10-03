import {
  useState,
} from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useRouter,
} from 'expo-router';

import { Screen } from '@/components/Screen';

import { colors } from '@/theme';

import { useDatabase } from '@/database/useDatabase';
import { completeOnboarding } from '@/database/repositories';

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
    <Screen>
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
                  '/'
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
    </Screen>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },

  step: {
    color: colors.blue,
    fontWeight: '700',
  },

  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },

  body: {
    marginTop: 14,
    lineHeight: 22,
    fontSize: 16,
    color: colors.textSecondary,
  },

  tipCard: {
    marginTop: 26,
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },

  tipTitle: {
    fontWeight: '800',
    color: colors.text,
  },

  tipText: {
    marginTop: 8,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  footer: {
    padding: 24,
  },

  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.blue,
  },

  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});