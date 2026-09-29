/**
 * GlassModal — a bottom-sheet / dialog built from the same glass material as
 * the rest of the app.
 *
 * Opening animation: backdrop fades + blurs in, the sheet scales up from 0.94
 * and slides in from the bottom. Closing reverses it. Uses the native `Modal`
 * so it stacks above everything, including the tab bar.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing, typography } from '@/theme';
import AnimatedPressable from './AnimatedPressable';

export type GlassModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  /** `sheet` slides from the bottom, `center` scales in place. */
  variant?: 'sheet' | 'center';
  /** Hide the close affordance (use for blocking confirmations). */
  hideClose?: boolean;
  /** Max height as a fraction of the screen. */
  maxHeightRatio?: number;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

export function GlassModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  variant = 'sheet',
  hideClose = false,
  maxHeightRatio = 0.82,
  contentStyle,
  testID,
}: GlassModalProps) {
  const insets = useSafeAreaInsets();
  const t = useSharedValue(0);

  React.useEffect(() => {
    t.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 300 : 200,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
    });
  }, [visible, t]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: t.value }));

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: variant === 'sheet'
      ? [
          { translateY: (1 - t.value) * 46 },
          { scale: 0.97 + t.value * 0.03 },
        ]
      : [{ scale: 0.93 + t.value * 0.07 }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      testID={testID}
    >
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <Pressable
            style={styles.backdrop}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close dialog"
          />
        </Animated.View>

        <Animated.View
          style={[
            variant === 'sheet' ? styles.sheetWrap : styles.centerWrap,
            {
              maxHeight: `${maxHeightRatio * 100}%`,
              paddingBottom: variant === 'sheet' ? Math.max(insets.bottom, spacing.lg) : 0,
            },
            sheetStyle,
          ]}
        >
          <View style={styles.sheet}>
            {variant === 'sheet' && <View style={styles.grabber} />}

            {(!!title || !hideClose) && (
              <View style={styles.header}>
                <View style={styles.headerText}>
                  {!!title && <Text style={styles.title}>{title}</Text>}
                  {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
                {!hideClose && (
                  <AnimatedPressable
                    onPress={onClose}
                    style={styles.closeBtn}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Ionicons name="close" size={19} color={colors.textSecondary} />
                  </AnimatedPressable>
                )}
              </View>
            )}

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[styles.scrollContent, contentStyle]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,3,10,0.72)',
  },
  sheetWrap: {
    width: '100%',
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.xxl,
    backgroundColor: 'rgba(12,17,40,0.96)',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.7,
    shadowRadius: 40,
    elevation: 24,
  },
  grabber: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  title: {
    ...typography.section,
  },
  subtitle: {
    ...typography.caption,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.border,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});

export default GlassModal;
