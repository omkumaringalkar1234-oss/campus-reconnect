/**
 * Screen headers.
 *
 * `AnimatedHeader` — the large, cinematic top of a screen. The title and
 * eyebrow animate in on mount and, when the page supplies its `scrollY`, the
 * whole block collapses into a compact bar as the user scrolls. That keeps a
 * 10-screen app feeling like one coherent product instead of ten pages.
 *
 * `SectionHeader` — the small labelled divider used between content groups.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing, typography, withAlpha } from '@/theme';
import { accent } from '@/theme/tokens';
import AnimatedPressable from './AnimatedPressable';

/* ──────────────────────────────  Screen header  ────────────────────────────── */

export type AnimatedHeaderProps = {
  title: string;
  /** Small uppercase label above the title, e.g. "GOOD MORNING". */
  eyebrow?: string;
  subtitle?: string;
  /** Vertical scroll offset of the owning ScrollView, for the collapse effect. */
  scrollY?: SharedValue<number>;
  /** Distance at which the header is fully collapsed. */
  collapseAt?: number;
  onBack?: () => void;
  /** Rendered on the right of the compact bar. */
  right?: React.ReactNode;
  /** Rendered on the right of the expanded hero area. */
  heroRight?: React.ReactNode;
  accentColor?: string;
  /** Stagger delay in ms for the entrance animation. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

export function AnimatedHeader({
  title,
  eyebrow,
  subtitle,
  scrollY,
  collapseAt = 90,
  onBack,
  right,
  heroRight,
  accentColor = accent.blue,
  delay = 0,
  style,
}: AnimatedHeaderProps) {
  const insets = useSafeAreaInsets();
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(
      delay,
      withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) })
    );
  }, [enter, delay]);

  const eyebrowStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 14 }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 22 }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: enter.value * 0.9,
    transform: [{ translateY: (1 - enter.value) * 16 }],
  }));

  // Collapse: fade the big block out as the compact bar fades in.
  const heroStyle = useAnimatedStyle(() => {
    if (!scrollY) return { opacity: 1 };
    const p = interpolate(scrollY.value, [0, collapseAt], [0, 1], 'clamp');
    return {
      opacity: 1 - p,
      transform: [{ translateY: interpolate(p, [0, 1], [0, -18]) }],
    };
  });

  const compactStyle = useAnimatedStyle(() => {
    if (!scrollY) return { opacity: 0, transform: [{ translateY: -8 }] };
    const p = interpolate(scrollY.value, [collapseAt * 0.55, collapseAt], [0, 1], 'clamp');
    return {
      opacity: p,
      transform: [{ translateY: interpolate(p, [0, 1], [-8, 0]) }],
    };
  });

  return (
    <View style={[{ paddingTop: insets.top + spacing.sm }, style]}>
      {/* Compact bar — appears on scroll */}
      <Animated.View style={[styles.compactRow, compactStyle]} pointerEvents="box-none">
        {onBack ? (
          <AnimatedPressable
            onPress={onBack}
            style={styles.iconBtn}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </AnimatedPressable>
        ) : null}
        <View style={styles.compactTitleWrap}>
          <Text numberOfLines={1} style={styles.compactTitle}>
            {title}
          </Text>
        </View>
        {right}
      </Animated.View>

      {/* Expanded hero block */}
      <Animated.View style={[styles.heroRow, heroStyle]} pointerEvents="box-none">
        <View style={styles.heroText}>
          {!!eyebrow && (
            <Animated.View style={[styles.eyebrowRow, eyebrowStyle]}>
              <View style={[styles.eyebrowDot, { backgroundColor: accentColor }]} />
              <Text style={styles.eyebrow}>{eyebrow}</Text>
            </Animated.View>
          )}
          <Animated.Text style={[styles.title, titleStyle]}>{title}</Animated.Text>
          {!!subtitle && (
            <Animated.Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Animated.Text>
          )}
        </View>
        {heroRight ?? (onBack ? undefined : right)}
      </Animated.View>
    </View>
  );
}

/* ──────────────────────────────  Section header  ────────────────────────────── */

export type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  /** Optional right-hand action, e.g. "See all". */
  action?: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({
  title,
  subtitle,
  action,
  icon,
  accentColor = accent.blue,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.sectionRow, style]}>
      <View style={styles.sectionLeft}>
        {!!icon && (
          <View style={[styles.sectionIcon, { backgroundColor: withAlpha(accentColor, 0.16) }]}>
            <Ionicons name={icon} size={14} color={accentColor} />
          </View>
        )}
        <View style={styles.sectionText}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  /* hero */
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.base,
  },
  heroText: {
    flex: 1,
    gap: 6,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eyebrow: {
    ...typography.overline,
  },
  title: {
    ...typography.hero,
  },
  subtitle: {
    ...typography.body,
    maxWidth: 420,
  },

  /* compact */
  compactRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    height: 44,
  },
  compactTitleWrap: {
    flex: 1,
  },
  compactTitle: {
    ...typography.cardTitle,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.border,
  },

  /* section */
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  sectionIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionText: {
    flex: 1,
    gap: 1,
  },
  sectionTitle: {
    ...typography.section,
    fontSize: 17,
  },
  sectionSubtitle: {
    ...typography.caption,
  },
});

export default AnimatedHeader;
