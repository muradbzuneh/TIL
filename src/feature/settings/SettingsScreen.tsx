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
import { Card } from '@/components/Card';
import {
  Icon,
} from '@/components/Icon';

import type { IconName } from '@/components/Icon';

import { DeleteLocalDataCard } from '@/feature/settings/DeleteLocalDataCard';

import {
  APP_VERSION,
} from '@/constants/app';

import {
  colors,
  radius,
  spacing,
} from '@/theme';

export default function SettingsScreen() {

  const router =
    useRouter();

  const rows: {
    icon: IconName;
    title: string;
    description: string;
    href: '/permissions' |
      '/global-limit' |
      '/privacy' |
      '/about';
  }[] = [
    {
      icon: 'permission',
      title: 'Permissions',
      description:
        'Usage Access, overlay and syncing',
      href: '/permissions',
    },
    {
      icon: 'limit',
      title: 'Global limit',
      description:
        'One combined daily budget',
      href: '/global-limit',
    },
    {
      icon: 'privacy',
      title: 'Privacy',
      description:
        'What TIL stores and why',
      href: '/privacy',
    },
    {
      icon: 'settings',
      title: 'About TIL',
      description: `Version ${APP_VERSION}`,
      href: '/about',
    },
  ];

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: 40,
        }}
      >
        <Text
          style={{
            marginBottom: spacing.lg,
            fontSize: 28,
            fontWeight: '800',
            letterSpacing: -0.6,
            color: colors.text,
          }}
        >
          Settings
        </Text>

        <Card>
          {rows.map((row) => (
            <Pressable
              key={row.href}
              onPress={() => {

                router.push(
                  row.href as never
                );
              }}
              style={({ pressed }) => [
                styles.row,
                pressed
                  ? styles.rowPressed
                  : null,
              ]}
            >
              <View
                style={styles.iconWrap}
              >
                <Icon
                  name={row.icon}
                  size={18}
                  color={colors.blue}
                />
              </View>

              <View
                style={styles.rowText}
              >
                <Text
                  style={styles.rowTitle}
                >
                  {row.title}
                </Text>

                <Text
                  style={styles.rowBody}
                >
                  {row.description}
                </Text>
              </View>

              <Icon
                name="details"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          ))}
        </Card>

        <DeleteLocalDataCard />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },

  rowPressed: {
    opacity: 0.6,
  },

  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.infoSoft,
  },

  rowText: {
    flex: 1,
  },

  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  rowBody: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
});
