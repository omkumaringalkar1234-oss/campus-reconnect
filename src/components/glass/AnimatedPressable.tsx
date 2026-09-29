/**
 * AnimatedPressable — the standard press feedback wrapper.
 *
 * Any control that should feel alive when tapped (icon buttons, chips, list
 * rows, small tiles) wraps itself in this instead of re-implementing a spring.
 * It deliberately does *not* wrap its child in a flex container, so it can be
 * dropped into existing layouts without changing them.
 */

import React from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { motion } from '@/theme';

export type AnimatedPressableProps = PressableProps & {
  /** How far the control contracts on press. */
  scaleTo?: number;
  /** Opacity floor while pressed. Set to 1 to disable the fade. */
  pressedOpacity?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function AnimatedPressable({
  scaleTo = 0.94,
  pressedOpacity = 0.78,
  onPressIn,
  onPressOut,
  style,
  children,
  disabled,
  ...rest
}: AnimatedPressableProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, scaleTo]) }],
    opacity: interpolate(pressed.value, [0, 1], [1, pressedOpacity]),
  }));

  return (
    <Animated.View style={[animatedStyle, disabled && { opacity: 0.45 }]}>
      <Pressable
        disabled={disabled}
        onPressIn={(e) => {
          pressed.value = withSpring(1, motion.press);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          pressed.value = withSpring(0, motion.press);
          onPressOut?.(e);
        }}
        style={style}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default AnimatedPressable;
