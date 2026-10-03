import {
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

import { APP_NAME } from '@/constants/app';

export default function WelcomeStep() {

  const router =
    useRouter();

  return (
    <SafeAreaView
      style={styles.container}
    >
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
              '/onboarding/usage-access'
            )
          }
        >
          <Text style={styles.buttonText}>
            Get started
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
    color: '#0369A1',
    fontWeight: '800',
  },

  title: {
    marginTop: 18,
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
  },

  body: {
    marginTop: 14,
    lineHeight: 22,
    fontSize: 16,
    color: '#475569',
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