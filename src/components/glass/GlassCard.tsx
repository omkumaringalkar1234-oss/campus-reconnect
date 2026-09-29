/**
 * GlassCard ― the foundational translucent surface.
 *
 * Composites, back to front:
 *   BlurView (real backdrop blur)
 *   ↓ translucent gradient fill
 *   ↓ inner top highlight (the "glass edge" that sells the refraction)
 *   ↓ 1px luminous border
 *   ↓ optional accent light-leak along one edge
 *
 * Every screen in the app is built from this, so the material stays identical
 * everywhere. Set `blur={false}` on dense lists to save frames.
 */

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, elevation, radii, spacing, withAlpha } from '@/theme';
import { accent } from '@/theme/tokens';

export type GlassTone = 'default' | 'strong' | 'sunken' | 'accent';

export type GlassCardProps = {
  children?: React.ReactNode;
  /** Corner radius ― defaults to `radii.lg`. */
  radius?: number;
  /** Inner padding. */
  padding?: number;
  /** Visual weight of the material. */
  tone?: GlassTone;
  /** Accent used for the edge light-leak + border tint. */
  accentColor?: string;
  /** Enable real backdrop blur. Disable inside long lists. */
  blur?: boolean;
  /** Blur strength (platform-scaled internally). */
  blurIntensity?: number;
  /** Depth: 0 = flush, 2 = maximum lift. */
  depth?: 0 | 1 | 2;
  /** Remove the outer shadow (e.g. inside an already-elevated parent). */
  flat?: boolean;
  /** Draw a hairline border. Defaults to true. */
  bordered?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  /** Rendered on top of the surface, inside the border radius. */
  overlay?: React.ReactNode;
};

const TONE_FILL: Record<GlassTone, readonly [string, string]> = {
  default: ['rgba(255,255,255,0.085)', 'rgba(255,255,255,0.028)'],
  strong: ['rgba(255,255,255,0.13)', 'rgba(255,255,255,0.05)'],
  sunken: ['rgba(3,4,14,0.42)', 'rgba(3,4,14,0.62)'],
  accent: [withAlpha(accent.blue, 0.2), withAlpha(accent.violet, 0.07)],
};

export function GlassCard({
  children,
  radius = radii.lg,
  padding = spacing.base,
  tone = 'default',
  accentColor,
  blur = true,
  blurIntensity = 26,
  depth = 1,
  flat = false,
  bordered = true,
  style,
  contentStyle,
  overlay,
}: GlassCardProps) {
  const [top, bottom] = TONE_FILL[tone];
  const webBlur = Math.round(blurIntensity * 1.4);
  const nativeBlur = Math.round(blurIntensity * 0.6);

  return (
    <View
      style={[
        styles.card,
        { borderRadius: radius, padding },
        flat
          ? null
          : depth === 0
            ? elevation.cardPressed
            : depth === 2
              ? elevation.cardHover
              : elevation.card,
        bordered && { borderWidth: StyleSheet.hairlineWidth * 2, borderColor: colors.border },
        accentColor && bordered
          ? { borderColor: withAlpha(accentColor, 0.34) }
          : null,
        style,
      ]}
    >
      {/* Backdrop blur */}
      {blur && (
        <BlurView
          intensity={Platform.OS === 'web' ? webBlur : nativeBlur}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
      )}

      {/* Translucent fill */}
      <LinearGradient
        colors={Platform.OS === 'web' ? [top, bottom] : [bottom, top]}
        startPoint={{ x: 0.1, y: 0 }}
        endPoint={{ x: 0.9, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />

      {/* Inner top highlight ― the refraction cue */}
      <View
        pointerEvents="none"
        style={[
          styles.highlight,
          {
            borderRadius: radius,
            borderTopWidth: StyleSheet.hairlineWidth * 2,
            borderColor: 'rgba(255,255,255,0.26)',
          },
        ]}
      />

      {/* Accent light-leak along the top edge */}
      {!!accentColor && (
        <LinearGradient
          pointerEvents="none"
          colors={[withAlpha(accentColor, 0.5), withAlpha(accentColor, 0.06), 'transparent']}
          startPoint={{ x: 0, y: 0 }}
          endPoint={{ x: 1, y: 0 }}
          style={[styles.leak, { borderRadius: radius }]}
        />
      )}

      <View style={[{ padding: 0 }, contentStyle]}>{children}</View>
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: colors.glass,
  },
  highlight: {
    ...StyleSheet.absoluteFill,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  leak: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
});

export default GlassCard;
