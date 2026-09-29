/**
 * ScreenBackground ― the cinematic base layer every screen sits on.
 *
 * Layers, back to front:
 *   1. Solid midnight-navy base
 *   2. Three slowly drifting aurora orbs (blue / violet / cyan)
 *   3. A faint holographic floor grid fading out toward the horizon
 *   4. Rising particles
 *   5. Top + bottom vignette so content always meets a dark edge
 *
 * Everything animates on the UI thread via Reanimated. Particle positions use
 * a deterministic seed so the layout is stable across re-renders and does not
 * flicker on web hydration.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { accent, colors, motion, palette, radii, withAlpha } from '@/theme';

/* ╀╀ Deterministic pseudo-random so particles never reshuffle ╀╀╀╀╀╀╀╀╀╀╀╀╀╀ */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/* ╀╀ One drifting aurora orb ╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀ */
function Aurora({
  color,
  size,
  start,
  end,
  duration,
  delay,
  opacity,
}: {
  color: string;
  size: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  duration: number;
  delay: number;
  opacity: number;
}) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const drift = () => {
      x.value = withRepeat(
        withTiming(end.x, { duration, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
      y.value = withRepeat(
        withTiming(end.y, { duration: Math.round(duration * 1.35), easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
      scale.value = withRepeat(
        withTiming(1.14, { duration: Math.round(duration * 1.6), easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    };
    const t = setTimeout(drift, delay);
    return () => {
      clearTimeout(t);
      cancelAnimation(x);
      cancelAnimation(y);
      cancelAnimation(scale);
    };
    // Intentionally mount-only: these are ambient loops, not reactive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: start.x + x.value },
      { translateY: start.y + y.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.aurora,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: -size * 0.35,
          top: -size * 0.35,
          backgroundColor: withAlpha(color, opacity),
        },
        Platform.select({
          web: { boxShadow: `0 0 ${Math.round(size * 0.55)}px ${Math.round(
            size * 0.16
          )}px ${withAlpha(color, opacity * 2.1)}` },
          default: {
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: opacity * 2.2,
            shadowRadius: size * 0.42,
            elevation: 0,
          },
        }),
        style,
      ]}
    />
  );
}

/* ╀╀ One rising particle ╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀ */
function Particle({
  x,
  size,
  color,
  duration,
  delay,
  drift,
  maxTravel,
}: {
  x: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  drift: number;
  maxTravel: number;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    const run = () => {
      t.value = 0;
      t.value = withRepeat(
        withTiming(1, { duration, easing: Easing.linear }),
        -1,
        false
      );
    };
    const handle = setTimeout(run, delay);
    return () => {
      clearTimeout(handle);
      cancelAnimation(t);
    };
  }, [t, duration, delay]);

  const style = useAnimatedStyle(() => ({
    opacity:
      Math.sin(t.value * Math.PI) * 0.5 + 0.06,
    transform: [
      { translateY: -t.value * maxTravel },
      { translateX: Math.sin(t.value * Math.PI * 2) * drift },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: x,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export type ScreenBackgroundProps = {
  children?: React.ReactNode;
  /** `screen` = full page base. `modal` = dimmer, fewer layers. */
  variant?: 'screen' | 'modal' | 'soft';
  /** Particle density. Lower it on list-heavy screens. */
  particles?: number;
  /** Turn the aurora drift off (used by the very busy food + map screens). */
  animated?: boolean;
  style?: ViewStyle;
  /** Optional extra tint washed over everything. */
  tint?: string;
};

export function ScreenBackground({
  children,
  variant = 'screen',
  particles,
  animated = true,
  style,
  tint,
}: ScreenBackgroundProps) {
  const particleCount = particles ?? (variant === 'soft' ? 8 : 16);

  const dots = useMemo(() => {
    const rand = seeded(20260926);
    return Array.from({ length: particleCount }, () => ({
      x: rand() * 100,
      size: 1.6 + rand() * 3.2,
      color: rand() > 0.72 ? accent.cyanBright : rand() > 0.4 ? accent.violetBright : '#FFFFFF',
      duration: 9000 + rand() * 11000,
      delay: rand() * 9000,
      drift: 6 + rand() * 16,
      maxTravel: 420 + rand() * 320,
    }));
  }, [particleCount]);

  return (
    <View style={[styles.root, style]}>
      {/* 1 ― base */}
      <View style={styles.base} />

      {/* 2 ― aurora wash */}
      {animated && (
        <>
          <Aurora
            color={accent.blue}
            size={340}
            start={{ x: 0, y: 0 }}
            end={{ x: 46, y: 58 }}
            duration={motion.ambient.duration}
            delay={0}
            opacity={0.2}
          />
          <Aurora
            color={accent.violet}
            size={300}
            start={{ x: 210, y: 120 }}
            end={{ x: -34, y: 96 }}
            duration={12000}
            delay={900}
            opacity={0.17}
          />
          <Aurora
            color={accent.cyan}
            size={240}
            start={{ x: 40, y: 330 }}
            end={{ x: 190, y: -40 }}
            duration={13500}
            delay={1800}
            opacity={0.11}
          />
        </>
      )}

      {/* Optional brand tint */}
      {!!tint && (
        <LinearGradient
          colors={[tint, 'transparent']}
          style={[styles.tint, { backgroundColor: withAlpha(tint, 0.07) }]}
        />
      )}

      {/* 3 ― holographic floor grid */}
      {variant === 'screen' && (
        <View pointerEvents="none" style={styles.gridWrap}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View
              key={i}
              style={[
                styles.gridLine,
                {
                  top: `${22 + i * 11}%`,
                  opacity: 0.05 + i * 0.012,
                },
              ]}
            />
          ))}
          <LinearGradient
            colors={['rgba(59,130,246,0.14)', 'transparent']}
            style={styles.gridFade}
          />
        </View>
      )}

      {/* 4 ― particles */}
      {animated &&
        dots.map((d, i) => (
          <Particle key={i} x={`${d.x}%`} {...d} />
        ))}

      {/* 5 ― vignettes */}
      <LinearGradient
        colors={['rgba(3,4,12,0.82)', 'transparent']}
        style={styles.fadeTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(3,4,12,0.9)']}
        style={styles.fadeBottom}
        pointerEvents="none"
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.base,
    overflow: 'hidden',
  },
  base: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
  },
  aurora: {
    position: 'absolute',
  },
  tint: {
    ...StyleSheet.absoluteFill,
  },
  gridWrap: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: accent.blueBright,
  },
  gridFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '42%',
  },
  particle: {
    position: 'absolute',
    bottom: -20,
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 170,
  },
});

export default ScreenBackground;
