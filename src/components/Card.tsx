import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { ReactNode } from 'react';

import {
  colors,
  radius,
  shadow,
} from '@/theme';

export function Card({
  children,
  style,
  muted = false,
}: {
  children: ReactNode;
  style?: object;
  muted?: boolean;
}) {

  return (
    <View
      style={[
        styles.card,
        muted
          ? styles.muted
          : null,
        shadow.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CardHeader({
  icon,
  title,
  trailing,
}: {
  icon?: ReactNode;
  title: string;
  trailing?: ReactNode;
}) {

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {icon}

        <Text style={styles.label}>
          {title}
        </Text>
      </View>

      {trailing}
    </View>
  );
}

export function CardTitle({
  text,
}: {
  text: string;
}) {

  return (
    <Text style={styles.title}>
      {text}
    </Text>
  );
}

export function BodyText({
  text,
  style,
}: {
  text: string;
  style?: object;
}) {

  return (
    <Text
      style={[
        styles.body,
        style,
      ]}
    >
      {text}
    </Text>
  );
}

export function Caption({
  text,
}: {
  text: string;
}) {

  return (
    <Text style={styles.caption}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({

  card: {
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor:
      colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.border,
  },

  muted: {
    backgroundColor:
      colors.surfaceMuted,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },

  body: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
    color: colors.textSecondary,
  },

  caption: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
});