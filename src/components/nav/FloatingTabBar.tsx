/**
 * FloatingTabBar — a detached, glass navigation bar.
 *
 * Instead of a full-width opaque bar glued to the bottom of the screen, this
 * floats above the content with a margin, real backdrop blur, a luminous
 * border and a soft coloured bloom underneath.
 *
 * Interactions
 *   • A pill indicator springs horizontally to the active tab.
 *   • The active icon scales up and takes a per-route accent colour.
 *   • Live badges (e.g. cart count) pop in on change.
 *
 * Positions are measured with `onLayout` rather than assumed, so the bar stays
 * correct if a label wraps or the system font scale is large.
 */

import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, elevation, fontFamily, motion, radii, spacing, withAlpha } from '@/theme';
import { accent } from '@/theme/tokens';
import AnimatedPressable from '@/components/glass/AnimatedPressable';
import { useTabBadge } from './TabBadgeContext';

/** Per-route accent so each destination has its own identity. */
const ROUTE_ACCENT: Record<string, string> = {
  index: accent.blue,
  map: accent.cyan,
  explore: accent.violet,
  food: accent.magenta,
  profile: accent.violetBright,
};

function accentFor(routeName: string) {
  return ROUTE_ACCENT[routeName] ?? accent.blue;
}

type TabMetrics = { x: number; width: number };

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { badges } = useTabBadge();

  const [metrics, setMetrics] = useState<Record<string, TabMetrics>>({});
  const indexX = useSharedValue(0);
  const indexW = useSharedValue(0);
  const [barReady, setBarReady] = useState(false);

  const activeIndex = state.index;

  // Spring the indicator to the active tab once its metrics are known.
  useEffect(() => {
    const route = state.routes[activeIndex];
    const m = route ? metrics[route.key] : undefined;
    if (!m) return;
    indexX.value = withSpring(m.x, motion.spring);
    indexW.value = withSpring(m.width, motion.spring);
  }, [activeIndex, metrics, state.routes, indexX, indexW]);

  // Width is animated as a layout prop (not a transform) so the pill's corner
  // radius stays circular instead of being stretched by scaleX.
  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: withTiming(barReady ? 1 : 0, { duration: 220 }),
    width: indexW.value,
    transform: [{ translateX: indexX.value }],
  }));

  const handlePress = useCallback(
    (routeKey: string, routeName: string, canFocus: boolean) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: routeKey,
        canPreventDefault: true,
      });
      if (!canFocus && !event.defaultPrevented) return;
      navigation.navigate(routeName);
    },
    [navigation]
  );

  return (
    <View
      style={[
        styles.wrap,
        { paddingBottom: Math.max(insets.bottom, tabBarBottomInset()) },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.bar, elevation.floating]}>
        {/* Backdrop blur */}
        <BlurView
          intensity={Platform.OS === 'web' ? 42 : 30}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        {/* Translucent tint + top sheen */}
        <LinearGradient
          colors={['rgba(24,32,74,0.72)', 'rgba(6,9,24,0.86)']}
          startPoint={{ x: 0.2, y: 0 }}
          endPoint={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.sheen} pointerEvents="none" />

        {/* Sliding active pill */}
        <Animated.View
          pointerEvents="none"
          style={[styles.indicator, indicatorStyle]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.20)', 'rgba(255,255,255,0.07)']}
            startPoint={{ x: 0, y: 0 }}
            endPoint={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.indicatorTop} pointerEvents="none" />
        </Animated.View>

        {/* Tabs */}
        <View style={styles.row}>
          {state.routes.map((route, i) => {
            const { options } = descriptors[route.key];
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : options.title ?? route.name;
            const focused = i === activeIndex;
            const color = accentFor(route.name);
            const badge = badges[route.name] ?? 0;

            return (
              <TabItem
                key={route.key}
                label={label}
                focused={focused}
                color={color}
                badge={badge}
                onPress={() => handlePress(route.key, route.name, !focused)}
                accessibilityState={options.tabBarAccessibilityLabel}
                onLayout={(e) => {
                  const { x, width } = e.nativeEvent.layout;
                  setMetrics((prev) => {
                    const existing = prev[route.key];
                    if (existing && Math.abs(existing.x - x) < 0.5 && Math.abs(existing.width - width) < 0.5) {
                      return prev;
                    }
                    return { ...prev, [route.key]: { x, width } };
                  });
                  if (i === activeIndex && !barReady) {
                    indexX.value = x;
                    indexW.value = width;
                    setBarReady(true);
                  }
                }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

/* ── One tab ─────────────────────────────────────────────────────────────── */

function TabItem({
  label,
  focused,
  color,
  badge,
  onPress,
  onLayout,
  accessibilityState,
}: {
  label: string;
  focused: boolean;
  color: string;
  badge: number;
  onPress: () => void;
  onLayout: (e: any) => void;
  accessibilityState?: string | undefined;
}) {
  const icon = useSharedValue(0);
  const badgePop = useSharedValue(0);
  const prevBadge = useRef(badge);
  const first = useRef(true);

  useEffect(() => {
    icon.value = withSpring(focused ? 1 : 0, motion.press);
  }, [focused, icon]);

  // Pop the badge whenever the count changes, and pulse it on tab focus.
  useEffect(() => {
    if (first.current) {
      prevBadge.current = badge;
      first.current = false;
      return;
    }
    if (badge !== prevBadge.current) {
      prevBadge.current = badge;
      badgePop.value = 0;
      badgePop.value = withSpring(1, { damping: 8, stiffness: 260, mass: 0.5 });
    }
  }, [badge, badgePop]);

  useEffect(() => {
    if (focused && badge > 0) {
      badgePop.value = 0;
      badgePop.value = withSpring(1, { damping: 8, stiffness: 260, mass: 0.5 });
    }
  }, [focused, badge, badgePop]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(icon.value, [0, 1], [0, -1.5]) },
      { scale: interpolate(icon.value, [0, 1], [1, 1.14]) },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(icon.value, [0, 1], [0.6, 1]),
    transform: [{ translateY: interpolate(icon.value, [0, 1], [0, -0.5]) }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badge > 0 ? 1 : 0,
    transform: [
      { scale: interpolate(badgePop.value, [0, 1], [0.4, 1]) },
      { translateY: interpolate(badgePop.value, [0, 1], [4, 0]) },
    ],
  }));

  const name = (label ?? '').toLowerCase();
  const iconName: keyof typeof Ionicons.glyphMap = focused
    ? (ICONS_ACTIVE[name] ?? ICONS[name] ?? 'ellipse')
    : (ICONS[name] ?? 'ellipse-outline');

  return (
    <AnimatedPressable
      onPress={onPress}
      onLayout={onLayout}
      scaleTo={0.9}
      pressedOpacity={0.7}
      style={styles.tab}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityState ?? label}
      testID={`tab-${name}`}
    >
      <View style={styles.tabInner}>
        <Animated.View style={iconStyle}>
          <Ionicons
            name={iconName}
            size={21}
            color={focused ? color : colors.textMuted}
          />
        </Animated.View>

        <Animated.Text
          numberOfLines={1}
          style={[
            styles.label,
            labelStyle,
            { color: focused ? colors.text : colors.textMuted },
          ]}
        >
          {label}
        </Animated.Text>

        {badge > 0 && (
          <Animated.View
            style={[styles.badge, { backgroundColor: color }, badgeStyle]}
            pointerEvents="none"
          >
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </Animated.View>
        )}
      </View>
    </AnimatedPressable>
  );
}

/* ── Icon maps ───────────────────────────────────────────────────────────── */

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home-outline',
  home: 'home-outline',
  map: 'map-outline',
  campus: 'map-outline',
  explore: 'compass-outline',
  food: 'restaurant-outline',
  canteen: 'restaurant-outline',
  profile: 'person-outline',
  '360': 'scan-outline',
};

const ICONS_ACTIVE: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home',
  home: 'home',
  map: 'map',
  campus: 'map',
  explore: 'compass',
  food: 'restaurant',
  canteen: 'restaurant',
  profile: 'person',
  '360': 'scan',
};

function tabBarBottomInset() {
  return Platform.select({ ios: 10, android: 10, default: 12 }) as number;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  bar: {
    flexDirection: 'row',
    height: 62,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.border,
    backgroundColor: 'rgba(8,12,30,0.55)',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  indicator: {
    position: 'absolute',
    top: 7,
    bottom: 7,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: withAlpha('#FFFFFF', 0.2),
  },
  indicatorTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  tab: {
    flex: 1,
  },
  tabInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 2,
  },
  label: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 10.5,
    letterSpacing: 0.2,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: '50%',
    marginRight: -22,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(6,9,24,0.9)',
  },
  badgeText: {
    fontFamily: fontFamily.displayBold,
    fontSize: 9.5,
    lineHeight: 12,
    color: '#FFFFFF',
  },
});

export default FloatingTabBar;
