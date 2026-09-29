/**
 * DeviceFrame (web) ― a photorealistic iPhone mockup.
 *
 * On web the whole app is presented inside a titanium iPhone sitting on a dark
 * studio backdrop with an ambient bloom underneath. This is what makes the web
 * build demo-ready: it always shows the app at true device proportions, at
 * 393 Ø 852pt, regardless of how big the browser window is.
 *
 * Everything is scaled with a single transform so layout inside the phone
 * never has to think about the outer viewport, and native platforms simply use
 * the passthrough `DeviceFrame.tsx` instead.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { accent, colors, radii, withAlpha } from '@/theme';

/** iPhone 15 Pro logical screen size. */
const PHONE_W = 393;
const PHONE_H = 852;
/** Bezel thickness drawn outside the screen area. */
const BEZEL = 11;
const RADIUS = 56;

export function DeviceFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();

  // Leave breathing room around the device, and never scale above 1:1.
  const scale = Math.min(1, (width - 48) / (PHONE_W + BEZEL * 2), (height - 56) / (PHONE_H + BEZEL * 2));

  const frameW = PHONE_W + BEZEL * 2;
  const frameH = PHONE_H + BEZEL * 2;

  return (
    <View style={styles.stage}>
      {/* Studio backdrop */}
      <LinearGradient
        colors={['#142126', '#080D10', '#030608']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.backdropGlow} pointerEvents="none">
        <LinearGradient
          colors={[withAlpha(accent.cyanBright, 0.24), 'transparent']}
          style={styles.glowBlob}
        />
        <LinearGradient
          colors={[withAlpha('#E3A77D', 0.16), 'transparent']}
          style={[styles.glowBlob, styles.glowBlobAlt]}
        />
      </View>

      {/* Caption */}
      <View style={styles.caption} pointerEvents="none">
        <Text style={styles.captionBrand}>CAMPUS CONNECT</Text>
        <Text style={styles.captionSub}>Futuristic 3D Glass Campus · iPhone preview</Text>
      </View>

      {/* Device */}
      <View
        style={[
          styles.deviceOuter,
          {
            width: frameW,
            height: frameH,
            borderRadius: RADIUS + BEZEL,
            transform: [{ scale }],
          },
        ]}
      >
        {/* Titanium bezel */}
        <LinearGradient
          colors={['#F4FAF8', '#91A7A8', '#EAF2F0', '#65777C', '#D8E4E2']}
          startPoint={{ x: 0, y: 0 }}
          endPoint={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.72)', 'rgba(210,245,245,0.08)', 'rgba(255,255,255,0.3)']}
          startPoint={{ x: 0.1, y: 0 }}
          endPoint={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.innerBezelLine} pointerEvents="none" />

        {/* Side buttons */}
        <View style={[styles.btn, styles.btnLeft1]} />
        <View style={[styles.btn, styles.btnLeft2]} />
        <View style={[styles.btn, styles.btnRight1]} />

        {/* Screen */}
        <View
          style={[
            styles.screen,
            { width: PHONE_W, height: PHONE_H, borderRadius: RADIUS },
          ]}
        >
          <View style={styles.screenGlassEdge} pointerEvents="none" />
          {children}

          {/* Dynamic Island */}
          <View style={styles.island} pointerEvents="none">
            <View style={styles.islandLens} />
          </View>

          {/* Home indicator */}
          <View style={styles.homeIndicator} pointerEvents="none" />
        </View>
      </View>

      <Text style={styles.footer} pointerEvents="none">
        Open on a phone, or resize this window ― the app scales to fit.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#04060F',
    overflow: 'hidden',
  },
  backdropGlow: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBlob: {
    position: 'absolute',
    width: 900,
    height: 620,
    borderRadius: 999,
  },
  glowBlobAlt: {
    transform: [{ translateX: 320 }, { translateY: 180 }],
  },

  deviceOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: BEZEL,
    ...Platform.select({
      web: {
        boxShadow:
          '0 60px 120px -30px rgba(0,0,0,0.9), 0 0 74px -18px rgba(125,224,226,0.3)',
      },
      default: {},
    }),
  },
  screen: {
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  innerBezelLine: {
    ...StyleSheet.absoluteFill,
    margin: 3,
    borderRadius: RADIUS + BEZEL - 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  screenGlassEdge: {
    ...StyleSheet.absoluteFill,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(226,248,248,0.34)',
    zIndex: 2,
  },

  island: {
    position: 'absolute',
    top: 11,
    left: '50%',
    marginLeft: -59,
    width: 118,
    height: 33,
    borderRadius: 999,
    backgroundColor: 'rgba(5,10,13,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 12,
  },
  islandLens: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#17282D',
    borderWidth: 1,
    borderColor: 'rgba(151,234,234,0.5)',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -67,
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.66)',
  },

  btn: {
    position: 'absolute',
    width: 3,
    borderRadius: 2,
    backgroundColor: '#607478',
  },
  btnLeft1: { left: -1.5, top: 210, height: 30 },
  btnLeft2: { left: -1.5, top: 256, height: 54 },
  btnRight1: { right: -1.5, top: 236, height: 84 },

  caption: {
    position: 'absolute',
    top: 26,
    alignItems: 'center',
    gap: 6,
  },
  captionBrand: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    letterSpacing: 5,
    color: 'rgba(229,247,245,0.72)',
  },
  captionSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    letterSpacing: 0.6,
    color: 'rgba(213,232,231,0.5)',
  },
  footer: {
    position: 'absolute',
    bottom: 18,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(213,232,231,0.42)',
  },
});

export { PHONE_H, PHONE_W, radii };
export default DeviceFrame;
