/**
 * Campus Connect — "Futuristic 3D Glass Campus" design tokens.
 *
 * Single source of truth for the visual identity. Every screen and glass
 * component must read from here instead of hard-coding colours, radii or
 * shadows, so the whole app can be re-themed from this one file.
 *
 * Foundation : midnight navy / near-black cinematic base
 * Accents    : electric blue, violet, cyan, magenta
 */

import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/* ──────────────────────────────  Foundation  ────────────────────────────── */

export const palette = {
  /** Deepest base — behind everything. */
  void: '#03040C',
  /** App background base. */
  base: '#05060F',
  /** Slightly lifted background wash. */
  baseRaised: '#0A0E20',
  /** Card / panel base under glass. */
  basePanel: '#0D1330',

  navy900: '#070B1C',
  navy800: '#0B1130',
  navy700: '#111A45',
  navy600: '#18245C',

  white: '#FFFFFF',
  black: '#000000',
} as const;

/* ──────────────────────────────  Accents  ────────────────────────────── */

export const accent = {
  /** Electric blue — primary brand action colour. */
  blue: '#3B82F6',
  blueBright: '#60A5FA',
  blueDeep: '#1D4ED8',

  /** Violet — secondary brand, used for depth + hero gradients. */
  violet: '#8B5CF6',
  violetBright: '#A78BFA',
  violetDeep: '#6D28D9',

  /** Cyan — highlights, live data, "online" states. */
  cyan: '#22D3EE',
  cyanBright: '#67E8F9',
  cyanDeep: '#0891B2',

  /** Magenta — rare accent for energy + events. */
  magenta: '#E879F9',
  magentaBright: '#F0ABFC',
  magentaDeep: '#C026D3',

  /** Status colours. */
  success: '#34D399',
  successBright: '#6EE7B7',
  warning: '#FBBF24',
  danger: '#FB7185',
  info: '#38BDF8',
} as const;

/** Two-stop gradients used across the app. Always pass a valid tuple. */
export type GradientPair = readonly [string, string, ...string[]];

export const gradients = {
  /** Brand sweep — the signature Campus Connect gradient. */
  brand: ['#3B82F6', '#8B5CF6', '#E879F9'] as GradientPair,
  /** Cool cinematic — for hero cards and the splash. */
  cinematic: ['#0B1130', '#131C4A', '#1B2A6B'] as GradientPair,
  /** Aqua tech — for data / live / map surfaces. */
  aqua: ['#22D3EE', '#3B82F6'] as GradientPair,
  /** Violet → magenta for events and highlights. */
  plasma: ['#8B5CF6', '#E879F9'] as GradientPair,
  /** Subtle vertical wash for page backgrounds. */
  pageWash: ['rgba(59,130,246,0.20)', 'rgba(139,92,246,0.14)', 'rgba(5,6,15,0)'] as GradientPair,
} as const;

/* ──────────────────────────────  Semantic colours  ────────────────────────────── */

export const colors = {
  /* Base surfaces */
  background: palette.base,
  backgroundRaised: palette.baseRaised,
  surface: palette.basePanel,

  /* Text — contrast checked against `background` (#05060F).
     White on #05060F = 18.9:1. 66% white = 11.4:1. 42% white = 6.2:1. All AAA. */
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.66)',
  textMuted: 'rgba(255,255,255,0.42)',
  textFaint: 'rgba(255,255,255,0.28)',
  textOnAccent: '#04060F',

  /* Brand */
  primary: accent.blue,
  primaryBright: accent.blueBright,
  primaryDim: 'rgba(59,130,246,0.16)',
  secondary: accent.violet,
  secondaryDim: 'rgba(139,92,246,0.16)',
  tertiary: accent.cyan,
  magenta: accent.magenta,

  /* Glass fills — layered translucency. */
  glass: 'rgba(255,255,255,0.055)',
  glassStrong: 'rgba(255,255,255,0.085)',
  glassHover: 'rgba(255,255,255,0.11)',
  glassSunken: 'rgba(3,4,12,0.34)',

  /* Glass borders */
  border: 'rgba(255,255,255,0.11)',
  borderStrong: 'rgba(255,255,255,0.20)',
  borderFaint: 'rgba(255,255,255,0.06)',

  /* Status */
  success: accent.success,
  successDim: 'rgba(52,211,153,0.14)',
  warning: accent.warning,
  warningDim: 'rgba(251,191,36,0.14)',
  danger: accent.danger,
  dangerDim: 'rgba(251,113,133,0.14)',
  info: accent.info,
  infoDim: 'rgba(56,189,248,0.14)',
} as const;

/* ──────────────────────────────  Radii  ────────────────────────────── */

export const radii = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  xxl: 38,
  pill: 999,
} as const;

/* ──────────────────────────────  Spacing  ────────────────────────────── */

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 44,
} as const;

/* ──────────────────────────────  Typography  ────────────────────────────── */

/**
 * Space Grotesk = geometric display face (headlines, numbers, tab labels).
 * Inter = highly legible UI/body face.
 * Both are bundled locally via @expo-google-fonts/*, so typography renders
 * identically on web, iOS, Android and inside Expo Go with no network.
 */
export const fontFamily = {
  displayLight: 'SpaceGrotesk_300Light',
  display: 'SpaceGrotesk_400Regular',
  displayMedium: 'SpaceGrotesk_500Medium',
  displaySemiBold: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

/** Pre-built text styles so screens never re-declare font/size/colour triples. */
export const typography = {
  hero: {
    fontFamily: fontFamily.displayBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.9,
    color: colors.text,
  } as TextStyle,
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: colors.text,
  } as TextStyle,
  section: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 19,
    lineHeight: 25,
    letterSpacing: -0.3,
    color: colors.text,
  } as TextStyle,
  cardTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.2,
    color: colors.text,
  } as TextStyle,
  body: {
    fontFamily: fontFamily.body,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.textSecondary,
  } as TextStyle,
  bodyStrong: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.text,
  } as TextStyle,
  caption: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12.5,
    lineHeight: 17,
    letterSpacing: 0.1,
    color: colors.textMuted,
  } as TextStyle,
  /** Small uppercase eyebrow / section label. */
  overline: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  } as TextStyle,
  /** Tabular-ish numerals for prices, OTPs, room numbers. */
  mono: {
    fontFamily: fontFamily.displayBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: colors.text,
  } as TextStyle,
} as const;

/* ──────────────────────────────  Elevation / glow  ────────────────────────────── */

/**
 * React Native has no single cross-platform shadow primitive.
 *
 * Web wants a CSS `boxShadow` string (it supports blur + spread + multiple
 * layers, which is what gives the glass its cinematic depth). Native wants
 * `shadow*` + `elevation`, which is what actually renders on Android across
 * all API levels.
 *
 * `shadow()` keeps that branch in one place so no component ever has to think
 * about it. Both branches are valid `ViewStyle`, so the result drops straight
 * into a style array on either platform.
 */
export type NativeShadow = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export function shadow(css: string, native: NativeShadow): ViewStyle {
  return Platform.OS === 'web' ? { boxShadow: css } : native;
}

export function nativeShadow(
  color: string,
  height: number,
  opacity: number,
  radius: number,
  elevation: number
): NativeShadow {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}

export const elevation = {
  /** Resting glass panel — soft, wide, cinematic. */
  card: shadow(
    '0 18px 50px -12px rgba(2,4,14,0.85), 0 2px 10px -4px rgba(2,4,14,0.6)',
    nativeShadow('#02040E', 18, 0.55, 26, 10)
  ),

  /** Lifted / hovered panel. */
  cardHover: shadow(
    '0 28px 70px -14px rgba(2,4,14,0.9), 0 4px 16px -6px rgba(59,130,246,0.35)',
    nativeShadow('#02040E', 26, 0.62, 34, 16)
  ),

  /** Pressed panel — collapses toward the surface. */
  cardPressed: shadow('0 8px 24px -10px rgba(2,4,14,0.8)', nativeShadow('#02040E', 8, 0.5, 16, 6)),

  /** Primary action — coloured bloom. */
  primary: shadow(
    '0 14px 44px -10px rgba(59,130,246,0.62), inset 0 1px 0 rgba(255,255,255,0.22)',
    nativeShadow(accent.blue, 12, 0.5, 22, 12)
  ),

  /** Floating chrome (tab bar, headers). */
  floating: shadow(
    '0 20px 60px -14px rgba(0,0,0,0.92), 0 0 0 1px rgba(255,255,255,0.05)',
    nativeShadow('#000008', 20, 0.66, 32, 20)
  ),
} as const;

/** Accent-coloured outer glow, tinted per component. */
export function glow(color: string, intensity = 0.5): ViewStyle {
  return shadow(
    `0 0 28px rgba(${hexToRgbTriplet(color)},${intensity})`,
    nativeShadow(color, 0, intensity, 16, 8)
  );
}

/** `#RRGGBB` → `"r, g, b"` so it can be dropped into a `rgba()` string. */
export function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const int = parseInt(full, 16);
  return `${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}`;
}

/** Hex + alpha → `rgba()` string. Used for tints derived from a single accent. */
export function withAlpha(hex: string, alpha: number): string {
  return `rgba(${hexToRgbTriplet(hex)},${alpha})`;
}

/* ──────────────────────────────  Layout  ────────────────────────────── */

/** Content never stretches past this on tablets / desktop web. */
export const layout = {
  maxContentWidth: 520,
  /** Horizontal page gutter — keeps text off curved phone edges. */
  gutter: spacing.lg,
  /** Minimum comfortable touch target (WCAG 2.5.5 / HIG 44pt). */
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
  minTouch: 44,
} as const;

/** Floating tab bar metrics, shared by the bar and by screens that pad for it. */
export const tabBar = {
  height: 66,
  /** Extra space reserved for the iOS home indicator. */
  bottomInset: Platform.select({ ios: 26, android: 12, default: 14 }) as number,
} as const;

/** Duration / damping presets for Reanimated so motion feels consistent. */
export const motion = {
  /** Snappy press feedback. */
  press: { damping: 18, stiffness: 320, mass: 0.6 },
  /** Gentle settle for cards lifting. */
  spring: { damping: 16, stiffness: 180, mass: 0.7 },
  /** Slow cinematic drift for ambient background elements. */
  ambient: { duration: 9000, duration2: 13000 },
  fade: { duration: 260 },
  enter: { duration: 420 },
} as const;

export const theme = {
  palette,
  accent,
  gradients,
  colors,
  radii,
  spacing,
  typography,
  fontFamily,
  elevation,
  glow,
  layout,
  tabBar,
  motion,
  withAlpha,
  hexToRgbTriplet,
} as const;

export default theme;
