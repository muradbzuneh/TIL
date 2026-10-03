import {
  StyleSheet,
  View,
} from 'react-native';

import type {
  ReactNode,
} from 'react';

import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/theme';

/**
 * TASK 22 — soft blue canvas.
 *
 * A gradient glow at the top plus two blurred-looking
 * blobs. Purely decorative, so it is hidden from
 * assistive tech.
 */
export function Screen({
  children,
  scroll = true,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: object;
}) {

  return (
    <View
      style={styles.root}
    >
      <LinearGradient
        colors={[
          colors.glowBlue,
          'rgba(238,243,251,0)',
        ]}
        style={styles.topGlow}
        pointerEvents="none"
      />

      <View
        style={styles.blobLeft}
        pointerEvents="none"
      />

      <View
        style={styles.blobRight}
        pointerEvents="none"
      />

      <View
        style={[
          styles.content,
          scroll
            ? styles.flex
            : null,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  flex: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  topGlow: {
    position: 'absolute',
    top: -80,
    left: -60,
    right: -60,
    height: 320,
  },

  blobLeft: {
    position: 'absolute',
    top: 120,
    left: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor:
      colors.glowBlue,
    opacity: 0.5,
  },

  blobRight: {
    position: 'absolute',
    top: 420,
    right: -120,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor:
      colors.glowIndigo,
    opacity: 0.55,
  },
});