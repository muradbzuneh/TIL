import {
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

import { APP_NAME } from '@/constants/app';

export default function WelcomeStep() {

  const router =
    useRouter();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {APP_NAME}
          </Text>
        </View>

        <Text style={styles.title}>
          Welcome to {APP_NAME}
        </Text>

        <Text style={styles.body}>
          {APP_NAME} keeps an eye on how much time you
          spend in the apps you care about and holds
          you to the daily limit you set.
        </Text>

        <Text style={styles.body}>
          Everything happens on this device. There is
          no account and no server.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.button}
          onPress={() =>
            router.push(
              '/(setup)/usage-access'
            )
          }
        >
          <Text style={styles.buttonText}>
            Get started
          </Text>
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
    justifyContent: 'center',
    padding: 24,
  },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E0F2FE',
  },

  badgeText: {
    color: colors.blue,
    fontWeight: '800',
  },

  title: {
    marginTop: 18,
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },

  body: {
    marginTop: 14,
    lineHeight: 22,
    fontSize: 16,
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