import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { Icon } from '@/components/Icon';

import {
  colors,
  radius,
} from '@/theme';

/**
 * Stack screens keep the shared back affordance and
 * title so navigation feels identical everywhere.
 */
export function StackHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {

  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() =>
          router.back()
        }
        style={styles.back}
        hitSlop={10}
      >
        <Icon
          name="back"
          size={20}
          color={colors.text}
        />
      </Pressable>

      <View style={styles.titles}>
        <Text style={styles.title}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },

  back: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  titles: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: colors.text,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
});