/**
 * TiltCard ― a pressable glass panel that tilts in 3D and sweeps a light
 * highlight across its face when touched.
 *
 * Physics on press:
 *   • scale contracts slightly (the card "presses in")
 *   • rotateX / rotateY tilt away from the viewer, in perspective
 *   • a diagonal shine sweeps across the glass
 *   • the depth shadow collapses, so the card reads as closer
 *
 * The tilt is deliberately small (max ~7°). Anything larger makes lists feel
 * broken and hurts tap accuracy, which is why this is a subtle depth cue
 * rather than a full 3D toy.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  type AccessibilityRole,
  type ViewStyle,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { motion, palette, radii, spacing, withAlpha } from '@/theme';
import { GlassCard, type GlassCardProps } from './GlassCard';

/** How far the card tips, in degrees, at full press. */
const TILT = 7;
/** Perspective distance ― larger = stronger 3D convergence. */
const PERSPECTIVE = 900;

export type TiltCardProps = Omit<GlassCardProps, 'style'> & {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  /** Max tilt in degrees. Lower it for wide cards. */
  intensity?: number;
  /** Animate a light sweep across the face on press. */
  shine?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  testID?: string;
  children?: React.ReactNode;
};

export function TiltCard({
  onPress,
  onLongPress,
  disabled = false,
  style,
  intensity = 1,
  shine = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  testID,
  children,
  radius = radii.lg,
  padding = spacing.base,
  ...cardProps
}: TiltCardProps) {
  const press = useSharedValue(0);
  const sweep = useSharedValue(0);

  const handlePressIn = useCallback(() => {
    press.value = withSpring(1, motion.press);
    if (shine) {
      // Restart the sweep from the left every time.
      sweep.value = 0;
      sweep.value = withTiming(1, { duration: 620 });
    }
  }, [press, shine, sweep]);

  const handlePressOut = useCallback(() => {
    press.value = withSpring(0, motion.spring);
  }, [press]);

  const animatedContainer = useAnimatedStyle(() => ({
    transform: [
      { perspective: PERSPECTIVE },
      {
        rotateX: `${interpolate(press.value, [0, 1], [0, -TILT * 0.55 * intensity])}deg`,
      },
      {
        rotateY: `${interpolate(press.value, [0, 1], [0, TILT * 0.35 * intensity])}deg`,
      },
      { scale: interpolate(press.value, [0, 1], [1, 0.972]) },
      // Lift on press: a hair of translateZ reads as depth on supporting platforms.
      { translateY: interpolate(press.value, [0, 1], [0, 2]) },
    ],
  }));

  const animatedShadow = useAnimatedStyle(() => ({
    opacity: interpolate(press.value, [0, 1], [1, 0.35]),
  }));

  const animatedShine = useAnimatedStyle(() => ({
    opacity: interpolate(sweep.value, [0, 0.15, 0.75, 1], [0, 0.9, 0.55, 0]),
    transform: [
      {
        translateX: interpolate(sweep.value, [0, 1], [-180, 420]),
      },
      { rotate: '18deg' },
    ],
  }));

  const interactive = !!(onPress || onLongPress);

  return (
    <Animated.View style={[animatedContainer, style]}>
      {/* Depth shadow sits behind the card and fades as the card is pressed. */}
      {interactive && (
        <Animated.View
          pointerEvents="none"
          style={[styles.shadowLayer, { borderRadius: radius }, animatedShadow]}
        />
      )}

      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole={accessibilityRole ?? (interactive ? 'button' : undefined)}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        testID={testID}
        style={styles.pressable}
      >
        <GlassCard radius={radius} padding={padding} {...cardProps}>
          {children}

          {/* Diagonal glass highlight that sweeps on press */}
          {shine && (
            <Animated.View pointerEvents="none" style={[styles.shine, animatedShine]}>
              <LinearGradient
                colors={[
                  'transparent',
                  withAlpha('#FFFFFF', 0.3),
                  'transparent',
                ]}
                startPoint={{ x: 0, y: 0 }}
                endPoint={{ x: 1, y: 0 }}
                style={styles.shineGradient}
              />
            </Animated.View>
          )}
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowLayer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: palette.black,
  },
  pressable: {
    flex: 1,
  },
  shine: {
    position: 'absolute',
    top: '-30%',
    bottom: '-30%',
    left: 0,
    width: 150,
  },
  shineGradient: {
    flex: 1,
    width: '100%',
  },
});

/** Shared press-scale for simple non-glass controls (chips, list rows). */
export function usePressScale() {
  const pressed = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.95]) }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.82]),
  }));
  return {
    animatedStyle: style,
    onPressIn: useCallback(() => {
      pressed.value = withSpring(1, motion.press);
    }, [pressed]),
    onPressOut: useCallback(() => {
      pressed.value = withSpring(0, motion.press);
    }, [pressed]),
  };
}

export default TiltCard;
