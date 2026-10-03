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

export default function OverlayStep() {

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
              '/onboarding/ready'
            )
          }
        >
          <Text style={styles.buttonText}>
            Continue
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