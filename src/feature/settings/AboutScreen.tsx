import {
  ScrollView,
  Text,
} from 'react-native';

import { Screen } from '@/components/Screen';
import {
  BodyText,
  Card,
} from '@/components/Card';
import { Icon } from '@/components/Icon';
import {
  StackHeader,
} from '@/components/StackHeader';

import {
  APP_NAME,
  APP_VERSION,
} from '@/constants/app';

import {
  colors,
  radius,
  spacing,
  typography,
} from '@/theme';

export default function AboutScreen() {

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: 40,
        }}
      >
        <StackHeader
          title="About TIL"
          subtitle={APP_VERSION}
        />

        <Card>
          <Text
            style={{
              fontSize: 42,
              fontWeight: '800',
              letterSpacing: -1,
              color: colors.text,
            }}
          >
            {APP_NAME}
          </Text>

          <Text
            style={{
              ...typography.body,
              marginTop: 4,
              color: colors.blue,
              fontWeight: '700',
            }}
          >
            Screen time, on your terms.
          </Text>

          <BodyText
            text="TIL watches the apps you choose, measures how long you use them, and stops you when you pass the limit you set."
          />
        </Card>

        <Card
          style={{
            marginTop: spacing.md,
          }}
        >
          {[
            {
              icon: 'usage' as const,
              title: 'Usage',
              body: 'Reads Android UsageStats for tracked apps.',
            },
            {
              icon: 'timer' as const,
              title: 'Manual timer',
              body: 'Lets you track apps TIL cannot see.',
            },
            {
              icon: 'limit' as const,
              title: 'Limits',
              body: 'Per-app and combined daily limits.',
            },
            {
              icon: 'reached' as const,
              title: 'Reached',
              body: 'Apps past their limit are blocked.',
            },
          ].map((row) => (
            <Card
              key={row.title}
              muted
              style={{
                marginTop: spacing.sm,
                padding: 14,
                borderRadius: radius.md,
              }}
            >
              <Icon
                name={row.icon}
                size={18}
                color={colors.blue}
              />

              <Text
                style={{
                  marginTop: 8,
                  fontSize: 15,
                  fontWeight: '700',
                  color: colors.text,
                }}
              >
                {row.title}
              </Text>

              <Text
                style={{
                  marginTop: 2,
                  fontSize: 13,
                  color: colors.textSecondary,
                  lineHeight: 19,
                }}
              >
                {row.body}
              </Text>
            </Card>
          ))}
        </Card>

        <Text
          style={{
            marginTop: spacing.lg,
            textAlign: 'center',
            fontSize: 12,
            color: colors.textMuted,
          }}
        >
          {APP_NAME} {APP_VERSION} · local only
        </Text>
      </ScrollView>
    </Screen>
  );
}