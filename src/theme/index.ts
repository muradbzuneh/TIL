import { Platform } from 'react-native';

/**
 * TASK 22 — visual tokens.
 *
 * Subtle blue base, blue -> indigo accent gradients,
 * restrained radii and soft shadows.
 */
export const colors = {
  background: '#EEF3FB',
  backgroundDeep: '#E2EAF7',

  surface: '#FFFFFF',
  surfaceGlass: 'rgba(255,255,255,0.82)',
  surfaceMuted: '#F6F9FE',

  border: 'rgba(120,140,175,0.18)',
  borderStrong: 'rgba(120,140,175,0.30)',

  blue: '#2F6BFF',
  indigo: '#5B4BFF',
  violet: '#7C5CFF',

  accentGradient: ['#2F6BFF', '#5B4BFF'] as const,

  glowBlue: 'rgba(47,107,255,0.16)',
  glowIndigo: 'rgba(91,75,255,0.12)',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  success: '#16A34A',
  warning: '#D97706',
  danger: '#E11D48',
  dangerSoft: '#FFE4E6',
  warningSoft: '#FEF3C7',
  successSoft: '#DCFCE7',
  infoSoft: '#DBEAFE',

  lockedSoft: '#FEE2E2',
  onAccent: '#FFFFFF',
} as const;

export const radius = {
  sm: 14,
  md: 18,
  lg: 22,
  pill: 999,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
} as const;

/**
 * Strong hierarchy: a single display size, then
 * titles, body and caption.
 */
export const typography = {
  display: {
    fontSize: 30,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800' as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  metric: {
    fontSize: 34,
    fontWeight: '800' as const,
    letterSpacing: -0.8,
  },
} as const;

export const shadow = {
  card: Platform.select({
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: '#2F6BFF',
      shadowOpacity: 0.08,
      shadowRadius: 18,
      shadowOffset: {
        width: 0,
        height: 8,
      },
    },
  }),
  raised: Platform.select({
    android: {
      elevation: 6,
    },
    default: {
      shadowColor: '#1E3A8A',
      shadowOpacity: 0.16,
      shadowRadius: 26,
      shadowOffset: {
        width: 0,
        height: 14,
      },
    },
  }),
} as const;
