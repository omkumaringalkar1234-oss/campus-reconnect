/**
 * Screen states ― loading, empty and error.
 *
 * Every data-backed screen renders one of these instead of an empty view, so
 * the app never shows a blank surface. Each state offers a concrete next step
 * (retry, adjust filters, go back) rather than just reporting a problem.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, radii, spacing, typography, withAlpha } from '@/theme';
import { accent } from '@/theme/tokens';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassCard } from '@/components/glass/GlassCard';

/* ╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀  Loading  ╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀ */

export function LoadingState({
  message = 'Loading…',
  /** Compact variant for inline / pull-to-refresh areas. */
  compact = false,
  style,
}: {
  message?: string;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.linear }),
      -1,
      false
    );
  }, [spin]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  if (compact) {
    return (
      <View style={[styles.compactRow, style]}>
        <ActivityIndicator size="small" color={accent.cyan} />
        <Text style={styles.compactText}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.center, style]} accessibilityRole="progressbar" accessibilityLabel={message}>
      <View style={styles.spinnerWrap}>
        <Animated.View style={[styles.spinner, ringStyle]}>
          <View style={styles.spinnerArc} />
        </Animated.View>
        <View style={styles.spinnerCore} />
      </View>
      <Text style={styles.stateTitle}>{message}</Text>
    </View>
  );
}

/** Skeleton block ― used while a specific card is still resolving. */
export function SkeletonBlock({
  height = 96,
  radius = radii.lg,
  style,
}: {
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 780, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 780, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, [pulse]);

  const style2 = useAnimatedStyle(() => ({ opacity: 0.35 + pulse.value * 0.3 }));

  return (
    <Animated.View
      style={[
        {
          height,
          borderRadius: radius,
          backgroundColor: colors.glass,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: colors.borderFaint,
        },
        style2,
        style,
      ]}
    />
  );
}

/* ╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀  Empty  ╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀ */

export function EmptyState({
  icon = 'sparkles-outline',
  title = 'Nothing here yet',
  message,
  actionLabel,
  onAction,
  accentColor = accent.violet,
  style,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(60, withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }));
  }, [enter]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 18 }, { scale: 0.96 + enter.value * 0.04 }],
  }));

  return (
    <Animated.View style={[styles.center, styles.padded, animStyle, style]}>
      <View style={[styles.stateIcon, { borderColor: withAlpha(accentColor, 0.3) }]}>
        <Ionicons name={icon} size={28} color={accentColor} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      {!!message && <Text style={styles.stateMessage}>{message}</Text>}
      {!!actionLabel && onAction && (
        <GlassButton
          label={actionLabel}
          onPress={onAction}
          variant="glass"
          size="sm"
          block={false}
          style={styles.stateAction}
        />
      )}
    </Animated.View>
  );
}

/* ╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀  Error  ╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀ */

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this right now. Check your connection and try again.',
  onRetry,
  retryLabel = 'Try again',
  /** Optional secondary escape hatch, e.g. "Go back". */
  secondaryLabel,
  onSecondary,
  style,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <GlassCard
      radius={radii.xl}
      padding={spacing.lg}
      accentColor={colors.danger}
      style={[styles.errorCard, style]}
    >
      <View style={styles.errorHead}>
        <View style={[styles.stateIcon, { borderColor: withAlpha(colors.danger, 0.34) }]}>
          <Ionicons name="cloud-offline-outline" size={24} color={colors.danger} />
        </View>
        <View style={styles.errorText}>
          <Text style={styles.stateTitle}>{title}</Text>
          <Text style={styles.stateMessage}>{message}</Text>
        </View>
      </View>
      {(!!onRetry || !!onSecondary) && (
        <View style={styles.errorActions}>
          {!!onRetry && (
            <GlassButton
              label={retryLabel}
              onPress={onRetry}
              variant="primary"
              size="sm"
              icon={<Ionicons name="refresh" size={15} color={colors.textOnAccent} />}
              style={styles.flexBtn}
            />
          )}
          {!!secondaryLabel && onSecondary && (
            <GlassButton
              label={secondaryLabel}
              onPress={onSecondary}
              variant="glass"
              size="sm"
              style={styles.flexBtn}
            />
          )}
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.huge,
  },
  padded: {
    paddingHorizontal: spacing.xl,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  compactText: {
    ...typography.caption,
  },
  spinnerWrap: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    ...StyleSheet.absoluteFill,
  },
  spinnerArc: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: 'transparent',
    borderTopColor: accent.cyan,
    borderRightColor: withAlpha(accent.violet, 0.85),
  },
  spinnerCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: accent.cyan,
  },
  stateIcon: {
    width: 62,
    height: 62,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  stateTitle: {
    ...typography.cardTitle,
    textAlign: 'center',
  },
  stateMessage: {
    ...typography.body,
    textAlign: 'center',
    maxWidth: 320,
  },
  stateAction: {
    marginTop: spacing.xs,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorCard: {
    margin: spacing.lg,
  },
  errorHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: {
    flex: 1,
    gap: 4,
  },
  errorActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  flexBtn: {
    flex: 1,
  },
});

export default LoadingState;
