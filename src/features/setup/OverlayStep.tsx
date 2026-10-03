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

export default function OverlayStep() {

  const router =
    useRouter();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Text style={styles.step}>
          Step 2 of 3
        </Text>

        <Text style={styles.title}>
          Overlay permission
        </Text>

        <Text style={styles.body}>
          The overlay permission lets another app draw
          above other apps. TIL uses it only if you
          later choose a lock screen over an app that
          reached its daily limit.
        </Text>

        <Text style={styles.body}>
          It is optional. TIL works fully without it
          and you can grant it later from Settings.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.button}
          onPress={() =>
            router.push(
              '/(setup)/ready'
            )
          }
        >
          <Text style={styles.buttonText}>
            Continue
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