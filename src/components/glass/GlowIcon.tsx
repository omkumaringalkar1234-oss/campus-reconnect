/**
 * GlowIcon — an icon inside a luminous, gradient-edged chip.
 *
 * Used for quick actions, list leading icons, status pills and empty states.
 * The glow is a real shadow on native and a `boxShadow` on web, tinted by the
 * `color` prop so each feature area gets its own accent.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, glow, radii, withAlpha } from '@/theme';
import { accent } from '@/theme/tokens';

export type GlowIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  /** Accent colour — drives the fill tint, border and glow. */
  color?: string;
  size?: number;
  /** `chip` = rounded square, `circle` = round, `bare` = no container. */
  shape?: 'chip' | 'circle' | 'bare';
  /** Optional slow halo, for "live" affordances. */
  pulse?: boolean;
  /** Dims the icon (inactive tab, disabled row). */
  dimmed?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GlowIcon({
  name,
  color = accent.blue,
  size = 20,
  shape = 'chip',
  pulse = false,
  dimmed = false,
  style,
}: GlowIconProps) {
  const p = useSharedValue(0);

  useEffect(() => {
    if (!pulse) return;
    p.value = 0;
    p.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );
    return () => cancelAnimation(p);
  }, [pulse, p]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - p.value),
    transform: [{ scale: 1 + p.value * 0.55 }],
  }));

  const radius = shape === 'circle' ? size * 1.9 / 2 : shape === 'chip' ? radii.md : 0;
  const box = shape === 'bare' ? size * 1.4 : size * 1.9;

  return (
    <View
      style={[{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }, style]}
      pointerEvents="none"
    >
      {/* Pulsing halo */}
      {pulse && (
        <Animated.View
          style={[
            styles.halo,
            {
              width: box,
              height: box,
              borderRadius: radius,
              backgroundColor: withAlpha(color, 0.5),
            },
            haloStyle,
          ]}
        />
      )}

      {shape !== 'bare' && (
        <View
          style={[
            styles.container,
            {
              width: box,
              height: box,
              borderRadius: radius,
              borderColor: withAlpha(color, dimmed ? 0.16 : 0.4),
              opacity: dimmed ? 0.55 : 1,
            },
            glow(color, dimmed ? 0.12 : 0.36),
          ]}
        >
          <LinearGradient
            colors={[withAlpha(color, dimmed ? 0.1 : 0.3), withAlpha(color, 0.05)]}
            startPoint={{ x: 0, y: 0 }}
            endPoint={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons
            name={name}
            size={size}
            color={dimmed ? colors.textMuted : color}
          />
        </View>
      )}

      {shape === 'bare' && (
        <Ionicons name={name} size={size} color={dimmed ? colors.textMuted : color} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  halo: {
    position: 'absolute',
  },
});

export default GlowIcon;
