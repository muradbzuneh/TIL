import {
  ScrollView,
} from 'react-native';

import { Screen } from '@/components/Screen';
import {
  BodyText,
  Card,
  CardHeader,
} from '@/components/Card';
import { Icon } from '@/components/Icon';
import {
  StackHeader,
} from '@/components/StackHeader';

import {
  colors,
  spacing,
} from '@/theme';

export default function PrivacyScreen() {

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
          title="Privacy"
          subtitle="What TIL stores and why"
        />

        <Card>
          <CardHeader
            icon={
              <Icon
                name="privacy"
                size={16}
                color={colors.blue}
              />
            }
            title="Everything stays here"
          />

          <BodyText
            text="TIL has no account and no server. Your tracked apps, limits and usage history live in a single SQLite database on this device."
          />

          <BodyText
            text="Nothing is uploaded, and there is no analytics or crash reporting."
          />
        </Card>

        <Card
          style={{
            marginTop: spacing.md,
          }}
        >
          <CardHeader
            icon={
              <Icon
                name="usage"
                size={16}
                color={colors.blue}
              />
            }
            title="What is read"
          />

          <BodyText
            text="Android reports how long each app is in the foreground. TIL reads those figures for apps you track, and uses manual timer input for the apps you add yourself."
          />
        </Card>

        <Card
          style={{
            marginTop: spacing.md,
          }}
        >
          <CardHeader
            icon={
              <Icon
                name="delete"
                size={16}
                color={colors.blue}
              />
            }
            title="What you can remove"
          />

          <BodyText
            text="Settings can reset usage history, or delete every tracked app, limit and record permanently."
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}