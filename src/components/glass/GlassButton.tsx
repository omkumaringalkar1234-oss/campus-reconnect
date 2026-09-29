/**
 * GlassButton ― a tactile, physical-feeling action control.
 *
 * Variants
 *   primary : brand gradient fill + travelling specular highlight + glow
 *   glass   : translucent surface, for secondary actions
 *   ghost   : borderless, for tertiary/inline actions
 *   danger  : red-tinted destructive action
 *
 * Every variant shares one press spring, one disabled treatment and one
 * loading treatment so behaviour never diverges between buttons.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, elevation, fontFamily, gradients, motion, radii, spacing, withAlpha } from '@/theme';
import { accent } from '@/theme/tokens';
import { GlassCard } from './GlassCard';

export type GlassButtonVariant = 'primary' | 'glass' | 'ghost' | 'danger';
export type GlassButtonSize = 'sm' | 'md' | 'lg';

export type GlassButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  /** Ionicons / MaterialCommunityIcons name rendered before the label. */
  icon?: React.ReactNode;
  iconAfter?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  /** Stretch to the container width. */
  block?: boolean;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

const SIZES = {
  sm: { height: 40, px: spacing.base, gap: 6, font: 13, radius: radii.sm },
  md: { height: 52, px: spacing.lg, gap: 8, font: 15, radius: radii.md },
  lg: { height: 60, px: spacing.xl, gap: 10, font: 16.5, radius: radii.lg },
} as const;

export function GlassButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconAfter,
  disabled = false,
  loading = false,
  block = true,
  accentColor,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: GlassButtonProps) {
  const press = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const dims = SIZES[size];
  const inactive = disabled || loading;

  // Primary buttons get a slow specular sweep so they read as premium at rest.
  useEffect(() => {
    if (variant !== 'primary' || inactive) return;
    shimmer.value = 0;
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
    return () => cancelAnimation(shimmer);
  }, [variant, inactive, shimmer]);

  const onPressIn = useCallback(() => {
    press.value = withSpring(1, motion.press);
  }, [press]);
  const onPressOut = useCallback(() => {
    press.value = withSpring(0, motion.press);
  }, [press]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.955]) }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.35, 0.7, 1], [0, 0.5, 0.22, 0]),
    transform: [
      { translateX: interpolate(shimmer.value, [0, 1], [-220, 460]) },
      { rotate: '16deg' },
    ],
  }));

  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';

  const labelColor = isPrimary
    ? colors.textOnAccent
    : isDanger
      ? colors.danger
      : colors.text;

  const body = (
    <>
      {/* ╀╀ Surface ╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀ */}
      {isPrimary && (
        <>
          <LinearGradient
            colors={gradients.brand as unknown as string[]}
            startPoint={{ x: 0, y: 0 }}
            endPoint={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Travelling specular highlight */}
          <Animated.View pointerEvents="none" style={[styles.shimmer, shimmerStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.55)', 'transparent']}
              startPoint={{ x: 0, y: 0 }}
              endPoint={{ x: 1, y: 0 }}
              style={styles.shimmerFill}
            />
          </Animated.View>
          {/* Top inner edge */}
          <View
            pointerEvents="none"
            style={[styles.innerEdge, { borderRadius: dims.radius }]}
          />
        </>
      )}

      {!isPrimary && !isGhost && (
        <GlassCard
          radius={dims.radius}
          padding={0}
          blur={false}
          flat
          style={StyleSheet.absoluteFill}
          tone={isDanger ? 'sunken' : 'default'}
        />
      )}

      {isGhost && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: dims.radius, backgroundColor: colors.borderFaint },
          ]}
        />
      )}

      {/* Danger / glass border */}
      {!isPrimary && (
        <View
          pointerEvents="none"
          style={[
            styles.border,
            {
              borderRadius: dims.radius,
              borderColor: isDanger
                ? withAlpha(colors.danger, 0.42)
                : isGhost
                  ? 'transparent'
                  : colors.border,
            },
          ]}
        />
      )}

      {/* ╀╀ Content ╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀ */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={labelColor} />
        ) : (
          <>
            {icon ? <View style={styles.icon}>{icon}</View> : null}
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                {
                  fontSize: dims.font,
                  color: labelColor,
                  fontFamily: fontFamily.displaySemiBold,
                  letterSpacing: 0.2,
                },
                isPrimary && styles.labelPrimary,
                textStyle,
              ]}
            >
              {label}
            </Text>
            {iconAfter ? <View style={styles.icon}>{iconAfter}</View> : null}
          </>
        )}
      </View>
    </>
  );

  return (
    <Animated.View
      style={[
        containerStyle,
        block && styles.block,
        isPrimary && !inactive && elevation.primary,
        !isPrimary && elevation.cardPressed,
        { opacity: inactive ? 0.45 : 1 },
        accentColor && isPrimary ? { borderColor: accentColor } : null,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={inactive}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: inactive, busy: loading }}
        testID={testID}
        style={({ pressed }) => [styles.pressable, { borderRadius: dims.radius }]}
      >
        {body}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  block: {
    width: '100%',
  },
  pressable: {
    width: '100%',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
  labelPrimary: {
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shimmer: {
    position: 'absolute',
    top: '-40%',
    bottom: '-40%',
    left: 0,
    width: 130,
  },
  shimmerFill: {
    flex: 1,
  },
  innerEdge: {
    ...StyleSheet.absoluteFill,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(255,255,255,0.4)',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  border: {
    ...StyleSheet.absoluteFill,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
});

export default GlassButton;
