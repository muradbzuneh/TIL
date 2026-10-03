import {
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import {
  BodyText,
  Card,
  CardHeader,
} from '@/components/Card';
import { Icon } from '@/components/Icon';

import { useDatabase } from '@/db/useDatabase';
import {
  deleteAllLocalData,
  resetUsageData,
} from '@/db/operations';

import {
  colors,
  radius,
  spacing,
} from '@/theme';

/**
 * TASK 19 — deleting everything must be impossible
 * to do by accident.
 *
 * Two deliberate actions are required:
 *   1. press and hold the danger button,
 *   2. confirm the full destructive list.
 *
 * After that the app returns to onboarding.
 */
export function DeleteLocalDataCard() {

  const db = useDatabase();
  const router = useRouter();

  const [
    holding,
    setHolding,
  ] = useState(false);

  const [
    busy,
    setBusy,
  ] = useState(false);

  const handleReset = () => {

    Alert.alert(
      'Reset usage data?',
      'All recorded usage and manual sessions are deleted. Your tracked apps and limits stay.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: () => {

            setBusy(true);

            resetUsageData(db)

              .catch((error) => {

                console.error(
                  'Reset failed:',
                  error
                );

                Alert.alert(
                  'Could not reset',
                  error instanceof Error
                    ? error.message
                    : 'Something went wrong.'
                );
              })

              .finally(() => {

                setBusy(false);
              });
          },
        },
      ]
    );
  };

  const handleDeleteConfirm = () => {

    setHolding(false);

    Alert.alert(
      'Delete Local Data?',
      'This will permanently remove:\n\n' +
        '• tracked apps\n' +
        '• limits\n' +
        '• manual sessions\n' +
        '• usage records\n' +
        '• global settings\n\n' +
        'This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {

            setBusy(true);

            deleteAllLocalData(db)

              .then(() => {

                router.replace(
                  '/onboarding/welcome'
                );
              })

              .catch((error) => {

                console.error(
                  'Delete failed:',
                  error
                );

                Alert.alert(
                  'Could not delete',
                  error instanceof Error
                    ? error.message
                    : 'Something went wrong.'
                );

                setBusy(false);
              });
          },
        },
      ]
    );
  };

  return (
    <Card
      style={{
        marginTop: spacing.lg,
        borderColor: colors.danger,
      }}
    >
      <CardHeader
        icon={
          <Icon
            name="delete"
            size={16}
            color={colors.danger}
          />
        }
        title="Danger zone"
      />

      <Pressable
        onPress={handleReset}
        disabled={busy}
        style={styles.linkRow}
      >
        <View>
          <Text
            style={styles.linkText}
          >
            Reset usage data
          </Text>

          <Text
            style={styles.linkHint}
          >
            Keeps apps and limits
          </Text>
        </View>

        <Icon
          name="refresh"
          size={16}
          color={colors.blue}
        />
      </Pressable>

      <View
        style={styles.divider}
      />

      <Text
        style={styles.dangerTitle}
      >
        Delete all local data
      </Text>

      <BodyText
        text="Removes every app, limit and record, then restarts onboarding."
      />

      <Pressable
        onPressIn={() => {

          setHolding(true);
        }}
        onPressOut={() => {

          setHolding(false);
        }}
        onLongPress={handleDeleteConfirm}
        delayLongPress={900}
        disabled={busy}
        style={[
          styles.dangerButton,
          holding
            ? styles.dangerButtonHeld
            : null,
        ]}
      >
        {busy ? (
          <ActivityIndicator
            color={colors.danger}
          />
        ) : (
          <>
            <Icon
              name="delete"
              size={18}
              color={colors.danger}
            />

            <Text
              style={styles.dangerLabel}
            >
              Press and hold to delete
              everything
            </Text>
          </>
        )}
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({

  linkRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  linkText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.blue,
  },

  linkHint: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },

  divider: {
    height: 1,
    marginVertical: spacing.md,
    backgroundColor: colors.border,
  },

  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  dangerButton: {
    marginTop: 14,
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  dangerButtonHeld: {
    opacity: 0.55,
  },

  dangerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
});