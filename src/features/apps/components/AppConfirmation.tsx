import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  formatDuration,
} from '@/utils/time';

type Props = {
  appName: string;

  dailyLimitSeconds: number;

  source:
    | 'installed'
    | 'manual';

  onConfirm: () => void;

  onCancel: () => void;

  saving?: boolean;
};

export default function AppConfirmation({
  appName,
  dailyLimitSeconds,
  source,
  onConfirm,
  onCancel,
  saving = false,
}: Props) {

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Confirm App Limit
      </Text>

      <Text style={styles.description}>
        Review this app before adding it
        to TIL.
      </Text>

      <View style={styles.card}>

        <Text style={styles.appName}>
          {appName}
        </Text>

        <Text style={styles.detail}>
          Type: {source}
        </Text>

        <Text style={styles.detail}>
          Daily limit:{' '}
          {formatDuration(
            dailyLimitSeconds
          )}
        </Text>

      </View>

      <View style={styles.actions}>

        <Pressable
          disabled={saving}
          style={[
            styles.button,
            styles.cancel,
          ]}
          onPress={onCancel}
        >
          <Text style={styles.cancelText}>
            Back
          </Text>
        </Pressable>

        <Pressable
          disabled={saving}
          style={[
            styles.button,
            styles.confirm,
          ]}
          onPress={onConfirm}
        >
          <Text style={styles.confirmText}>
            {saving
              ? 'Saving...'
              : 'Confirm & Save'}
          </Text>
        </Pressable>

      </View>

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      width: '100%',
    },

    title: {
      fontSize: 22,
      fontWeight: '800',
      color: '#0F172A',
    },

    description: {
      marginTop: 6,
      color: '#64748B',
      lineHeight: 20,
    },

    card: {
      marginTop: 20,
      padding: 18,
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },

    appName: {
      fontSize: 18,
      fontWeight: '800',
      color: '#0F172A',
    },

    detail: {
      marginTop: 8,
      color: '#64748B',
    },

    actions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 24,
    },

    button: {
      flex: 1,
      minHeight: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },

    cancel: {
      backgroundColor: '#E2E8F0',
    },

    confirm: {
      backgroundColor: '#208AEF',
    },

    cancelText: {
      color: '#334155',
      fontWeight: '700',
    },

    confirmText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });