import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Button,
} from '@/components/Button';

import { Icon } from '@/components/Icon';

import type { IconName } from '@/components/Icon';

import {
  colors,
  radius,
  spacing,
} from '@/theme';

/**
 * TASK 23 — empty, error and permission states.
 *
 * One layout so the three states feel like the same
 * product rather than three different screens.
 */
export function StatePanel({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  tone = 'neutral',
}: {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'neutral' | 'danger' | 'warning';
}) {

  const toneColor =
    tone === 'danger'
      ? colors.danger
      : tone === 'warning'
        ? colors.warning
        : colors.blue;

  return (
    <View
      style={styles.panel}
    >
      <View
        style={[
          styles.badge,
          {
            backgroundColor:
              tone === 'danger'
                ? colors.dangerSoft
                : tone === 'warning'
                  ? colors.warningSoft
                  : colors.infoSoft,
          },
        ]}
      >
        <Icon
          name={icon}
          size={26}
          color={toneColor}
        />
      </View>

      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.message}>
        {message}
      </Text>

      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          icon={
            tone === 'danger'
              ? 'refresh'
              : tone === 'warning'
                ? 'permission'
                : 'add'
          }
          variant={
            tone === 'danger'
              ? 'secondary'
              : 'primary'
          }
          onPress={onAction}
        />
      ) : null}
    </View>
  );
}

export function EmptyState({
  actionLabel,
  onAction,
}: {
  actionLabel: string;
  onAction: () => void;
}) {

  return (
    <StatePanel
      icon="apps"
      title="No apps tracked yet"
      message="Choose the apps you want TIL to help you manage."
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}

export function ErrorState({
  title = "Couldn't update usage",
  message = 'Your saved limits are safe.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry: () => void;
}) {

  return (
    <StatePanel
      icon="warning"
      tone="danger"
      title={title}
      message={message}
      actionLabel="Try Again"
      onAction={onRetry}
    />
  );
}

export function PermissionState({
  onGrant,
}: {
  onGrant: () => void;
}) {

  return (
    <StatePanel
      icon="permission"
      tone="warning"
      title="Usage Access required"
      message="TIL can't verify your Android usage until permission is granted."
      actionLabel="Grant Permission"
      onAction={onGrant}
    />
  );
}

const styles = StyleSheet.create({

  panel: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  badge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    marginTop: spacing.md,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: colors.text,
  },

  message: {
    marginTop: 6,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
  },
});