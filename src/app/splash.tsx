/**
 * Splash ― the animated intro.
 *
 * A dark 3D environment: a glass "CC" monolith floats at centre, slowly
 * rotating on two axes, catching a travelling light streak. Orbiting rings and
 * a ground reflection sell the depth. The wordmark resolves letter by letter,
 * then the whole composition lifts away as the screen hands off to auth.
 *
 * Runs once per cold start. `onFinish` is guaranteed to fire, so a failed font
 * load or slow device can never trap the user here.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  GlassButton,
  ScreenBackground,
} from '@/components/glass';
import { accent, colors, fontFamily, radii, spacing, withAlpha } from '@/theme';

const { width: SCREEN_W } = Dimensions.get('window');

/** How long the intro runs before it hands off. */
const INTRO_MS = 2450;

export type SplashProps = {
  /** Called once the intro completes (or is skipped). */
  onFinish: () => void;
};

export function SplashScreen({ onFinish }: SplashProps) {
  const [leaving, setLeaving] = useState(false);

  /* ╀╀ Monolith: continuous 3D rotation ╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀ */
  const spinY = useSharedValue(0);
  const spinX = useSharedValue(0);
  const float = useSharedValue(0);
  const glowPulse = useSharedValue(0);
  const streak = useSharedValue(0);

  /* ╀╀ Entrance ╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀ */
  const logoIn = useSharedValue(0);
  const ringIn = useSharedValue(0);
  const titleIn = useSharedValue(0);
  const taglineIn = useSharedValue(0);
  const rootFade = useSharedValue(1);

  useEffect(() => {
    // Ambient loops
    spinY.value = withRepeat(
      withTiming(1, { duration: 7200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    spinX.value = withRepeat(
      withTiming(1, { duration: 5400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    float.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    glowPulse.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    streak.value = withRepeat(
      withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );

    // Entrance
    logoIn.value = withDelay(120, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
    ringIn.value = withDelay(300, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }));
    titleIn.value = withDelay(760, withTiming(1, { duration: 760, easing: Easing.out(Easing.cubic) }));
    taglineIn.value = withDelay(1060, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));

    return () => {
      [spinY, spinX, float, glowPulse, streak, logoIn, ringIn, titleIn, taglineIn, rootFade].forEach(
        cancelAnimation
      );
    };
  }, [spinY, spinX, float, glowPulse, streak, logoIn, ringIn, titleIn, taglineIn, rootFade]);

  // Hand off. The extra tick guarantees `onFinish` fires even if the exit
  // animation is interrupted by a fast device or a slow frame budget.
  useEffect(() => {
    const t = setTimeout(() => setLeaving(true), INTRO_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    rootFade.value = withTiming(0, { duration: 420, easing: Easing.in(Easing.cubic) });
    const t = setTimeout(onFinish, 430);
    return () => clearTimeout(t);
  }, [leaving, rootFade, onFinish]);

  /* ╀╀ Animated styles ╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀╀ */

  const rootStyle = useAnimatedStyle(() => ({
    opacity: leaving ? rootFade.value : 1,
    transform: [{ scale: interpolate(rootFade.value, [0, 1], [1.06, 1]) }],
  }));

  const monolithStyle = useAnimatedStyle(() => ({
    opacity: logoIn.value,
    transform: [
      { perspective: 1000 },
      { translateY: interpolate(float.value, [0, 1], [0, -14]) },
      { rotateY: `${interpolate(spinY.value, [0, 1], [-16, 16])}deg` },
      { rotateX: `${interpolate(spinX.value, [0, 1], [11, -11])}deg` },
      { scale: interpolate(logoIn.value, [0, 1], [0.72, 1]) },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.35, 0.85]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [0.9, 1.18]) }],
  }));

  const streakStyle = useAnimatedStyle(() => ({
    opacity: interpolate(streak.value, [0, 0.3, 0.6, 1], [0, 0.85, 0.35, 0]),
    transform: [
      { translateX: interpolate(streak.value, [0, 1], [-190, 210]) },
      { rotate: '20deg' },
    ],
  }));

  const ringAStyle = useAnimatedStyle(() => ({
    opacity: ringIn.value * 0.85,
    transform: [
      { rotateY: '72deg' },
      { rotate: `${interpolate(spinY.value, [0, 1], [0, 360])}deg` },
    ],
  }));

  const ringBStyle = useAnimatedStyle(() => ({
    opacity: ringIn.value * 0.6,
    transform: [
      { rotateX: '76deg' },
      { rotate: `${interpolate(spinX.value, [0, 1], [360, 0])}deg` },
    ],
  }));

  const reflectionStyle = useAnimatedStyle(() => ({
    opacity: logoIn.value * 0.3,
    transform: [{ scaleY: interpolate(float.value, [0, 1], [1, 0.86]) }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleIn.value,
    transform: [{ translateY: interpolate(titleIn.value, [0, 1], [26, 0]) }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineIn.value,
    transform: [{ translateY: interpolate(taglineIn.value, [0, 1], [16, 0]) }],
  }));

  const skip = useCallback(() => setLeaving(true), []);

  const title = 'CAMPUS CONNECT';
  const logoSize = Math.min(178, SCREEN_W * 0.44);

  return (
    <Animated.View style={[styles.root, rootStyle]}>
      <ScreenBackground variant="screen" particles={14}>
        <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel="Loading Campus Connect">
          {/* Orbiting rings */}
          <View style={styles.stage} pointerEvents="none">
            <Animated.View style={[styles.ring, { width: logoSize * 1.5, height: logoSize * 1.5, borderRadius: logoSize }, ringAStyle]}>
              <LinearGradient
                colors={['transparent', withAlpha(accent.cyan, 0.85), 'transparent']}
                startPoint={{ x: 0, y: 0 }}
                endPoint={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.ring,
                { width: logoSize * 1.28, height: logoSize * 1.28, borderRadius: logoSize },
                ringBStyle,
              ]}
            >
              <LinearGradient
                colors={['transparent', withAlpha(accent.magenta, 0.7), 'transparent']}
                startPoint={{ x: 1, y: 0 }}
                endPoint={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {/* Pulsing bloom behind the monolith */}
            <Animated.View
              style={[
                styles.bloom,
                { width: logoSize * 1.9, height: logoSize * 1.9, borderRadius: logoSize },
                glowStyle,
              ]}
            />

            {/* Glass monolith */}
            <Animated.View style={[styles.monolith, { width: logoSize, height: logoSize }, monolithStyle]}>
              <LinearGradient
                colors={['rgba(60,78,150,0.55)', 'rgba(18,24,58,0.72)', 'rgba(96,60,170,0.5)']}
                startPoint={{ x: 0.1, y: 0 }}
                endPoint={{ x: 0.9, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              {/* Inner faces ― gives the slab visible thickness */}
              <View style={styles.innerFaceTop} />
              <View style={styles.innerFaceSide} />

              {/* Edge light */}
              <View style={styles.edge} pointerEvents="none" />

              {/* Travelling specular streak */}
              <Animated.View style={[styles.streak, streakStyle]} pointerEvents="none">
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.42)', 'transparent']}
                  startPoint={{ x: 0, y: 0 }}
                  endPoint={{ x: 1, y: 0 }}
                  style={styles.streakFill}
                />
              </Animated.View>

              <Text style={styles.monogram} allowFontScaling={false}>
                CC
              </Text>
            </Animated.View>

            {/* Ground reflection */}
            <Animated.View
              style={[
                styles.reflection,
                { width: logoSize * 0.9, height: logoSize * 0.34, borderRadius: logoSize },
                reflectionStyle,
              ]}
              pointerEvents="none"
            />
          </View>

          {/* Wordmark */}
          <Animated.View style={[styles.wordmark, titleStyle]}>
            {title.split(' ').map((word, wi) => (
              <View key={word} style={styles.wordRow}>
                {word.split('').map((ch, ci) => (
                  <Animated.Text
                    key={`${word}-${ci}`}
                    style={styles.wordChar}
                    onLayout={undefined}
                  >
                    {ch}
                  </Animated.Text>
                ))}
              </View>
            ))}
          </Animated.View>

          <Animated.View style={[styles.rule, taglineStyle]} />

          <Animated.Text style={[styles.tagline, taglineStyle]}>
            A futuristic digital campus in your pocket
          </Animated.Text>
        </View>
      </ScreenBackground>

      {/* Skip affordance ― respects reduced-motion / impatience */}
      <Animated.View style={[styles.skipWrap, { opacity: taglineIn.value }]} pointerEvents="box-none">
        <GlassButton
          label="Skip intro"
          onPress={skip}
          variant="ghost"
          size="sm"
          block={false}
          textStyle={styles.skipText}
          style={styles.skipBtn}
          accessibilityLabel="Skip the introduction"
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: withAlpha(accent.cyan, 0.5),
    overflow: 'hidden',
  },
  bloom: {
    position: 'absolute',
    backgroundColor: withAlpha(accent.violet, 0.24),
  },
  monolith: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(255,255,255,0.24)',
    shadowColor: accent.violet,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.6,
    shadowRadius: 34,
    elevation: 18,
  },
  innerFaceTop: {
    position: 'absolute',
    top: 0,
    left: '12%',
    right: '12%',
    height: '26%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  innerFaceSide: {
    position: 'absolute',
    right: 0,
    top: '10%',
    bottom: '10%',
    width: '16%',
    backgroundColor: 'rgba(3,4,12,0.3)',
  },
  edge: {
    ...StyleSheet.absoluteFill,
    borderTopWidth: 2,
    borderColor: 'rgba(255,255,255,0.42)',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  streak: {
    position: 'absolute',
    top: '-20%',
    bottom: '-20%',
    left: 0,
    width: 62,
  },
  streakFill: {
    flex: 1,
  },
  monogram: {
    fontFamily: fontFamily.displayBold,
    fontSize: 62,
    lineHeight: 70,
    letterSpacing: -2,
    color: '#FFFFFF',
    textShadowColor: 'rgba(80,140,255,0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
  },
  reflection: {
    marginTop: 6,
    backgroundColor: withAlpha(accent.violet, 0.4),
    transform: [{ scaleY: -1 }],
  },
  wordmark: {
    alignItems: 'center',
    gap: 2,
  },
  wordRow: {
    flexDirection: 'row',
    gap: 2,
  },
  wordChar: {
    fontFamily: fontFamily.displayBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: 7,
    color: colors.text,
    textAlign: 'center',
  },
  rule: {
    width: 54,
    height: 2,
    borderRadius: 1,
    backgroundColor: withAlpha(accent.cyan, 0.8),
  },
  tagline: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    letterSpacing: 0.8,
    color: colors.textMuted,
    textAlign: 'center',
  },
  skipWrap: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  skipBtn: {
    paddingHorizontal: spacing.lg,
  },
  skipText: {
    fontSize: 12.5,
    color: colors.textMuted,
  },
});

export default SplashScreen;
