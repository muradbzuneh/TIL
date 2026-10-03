import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import {
  Icon,
} from '@/components/Icon';

import type { IconName } from '@/components/Icon';

import {
  colors,
  radius,
} from '@/theme';

type Variant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost';

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
}) {

  const isDisabled =
    disabled || loading;

  const content = (
    <View style={styles.row}>
      {icon ? (
        <Icon
          name={icon}
          size={18}
          color={
            variant === 'primary'
              ? colors.onAccent
              : variant === 'danger'
                ? colors.danger
                : colors.textSecondary
          }
        />
      ) : null}

      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary'
              ? colors.onAccent
              : colors.textSecondary
          }
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'secondary'
              ? styles.labelSecondary
              : null,
            variant === 'danger'
              ? styles.labelDanger
              : null,
            variant === 'ghost'
              ? styles.labelGhost
              : null,
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={styles.pressable}
      >
        <LinearGradient
          colors={
            isDisabled
              ? [
                  '#B9C6DE',
                  '#C7D2E6',
                ]
              : colors.accentGradient
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primary}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.pressable,
        variant === 'danger'
          ? styles.danger
          : styles.secondary,
        isDisabled
          ? styles.disabled
          : null,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({

  pressable: {
    borderRadius: radius.md,
  },

  primary: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },

  secondary: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  danger: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
  },

  disabled: {
    opacity: 0.6,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onAccent,
  },

  labelSecondary: {
    color: colors.textSecondary,
  },

  labelDanger: {
    color: colors.danger,
  },

  labelGhost: {
    color: colors.blue,
  },
});