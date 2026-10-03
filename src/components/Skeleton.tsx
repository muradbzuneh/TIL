import {
  useEffect,
  useState,
} from 'react';

import {
  Animated,
  StyleSheet,
  View,
} from 'react-native';

import {
  colors,
  radius,
} from '@/theme';

/**
 * TASK 23 — loading placeholders.
 *
 * Skeletons keep the layout stable instead of
 * flashing an empty screen while data loads.
 */
function usePulse() {

  const [pulse] = useState(
    () => new Animated.Value(0.35)
  );

  useEffect(() => {

    const animation =
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            pulse,
            {
              toValue: 0.7,
              duration: 700,
              useNativeDriver: true,
            }
          ),
          Animated.timing(
            pulse,
            {
              toValue: 0.35,
              duration: 700,
              useNativeDriver: true,
            }
          ),
        ])
      );

    animation.start();

    return () =>
      animation.stop();
  }, [pulse]);

  return pulse;
}

export function SkeletonBlock({
  width = '100%',
  height = 14,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  style?: object;
}) {

  const pulse = usePulse();

  return (
    <Animated.View
      style={[
        styles.block,
        {
          width,
          height,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({
  rows = 3,
  style,
}: {
  rows?: number;
  style?: object;
}) {

  return (
    <View
      style={[
        styles.card,
        style,
      ]}
    >
      <View style={styles.row}>
        <SkeletonBlock
          width={38}
          height={38}
        />

        <View style={styles.rowText}>
          <SkeletonBlock
            width="55%"
            height={15}
          />

          <SkeletonBlock
            width="35%"
            height={11}
            style={styles.spaced}
          />
        </View>
      </View>

      {
        Array.from(
          { length: rows }
        ).map((_, index) => (
          <SkeletonBlock
            key={index}
            width={
              index % 2 === 0
                ? '80%'
                : '55%'
            }
            height={11}
            style={styles.spaced}
          />
        ))
      }
    </View>
  );
}

export function SkeletonList({
  count = 3,
}: {
  count?: number;
}) {

  return (
    <View
      accessibilityLabel="Loading"
    >
      {
        Array.from(
          { length: count }
        ).map((_, index) => (
          <SkeletonCard
            key={index}
            style={styles.spacedCard}
          />
        ))
      }
    </View>
  );
}

const styles = StyleSheet.create({

  card: {
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  block: {
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  rowText: {
    flex: 1,
  },

  spaced: {
    marginTop: 8,
  },

  spacedCard: {
    marginBottom: 10,
  },
});