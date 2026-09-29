/**
 * GlassInput — a floating glass text field.
 *
 * On focus the field lifts, gains a luminous accent border and raises its
 * inner glow. The label shrinks into an "over-label" above the field so the
 * control stays readable once it has content, and a trailing affordance
 * (password eye / clear button) slides in.
 *
 * The `TextInput` itself is never animated — only the wrapper is — so typing
 * stays at full framerate on low-end Android.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useCallback, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import {
  colors,
  fontFamily,
  radii,
  spacing,
  typography,
  withAlpha,
} from '@/theme';
import { accent } from '@/theme/tokens';
import AnimatedPressable from './AnimatedPressable';

export type GlassInputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  /** Ionicons name shown inside the field on the left. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Tints the focus ring. Defaults to electric blue. */
  accentColor?: string;
  error?: string | null;
  /** Right-hand accessory. Defaults to a show/hide toggle for passwords. */
  trailing?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  /** Hide the floating label entirely (for compact search fields). */
  bare?: boolean;
};

export const GlassInput = forwardRef<TextInput, GlassInputProps>(function GlassInput(
  {
    label,
    icon,
    accentColor = accent.blue,
    error,
    trailing,
    containerStyle,
    inputStyle,
    bare = false,
    secureTextEntry,
    onFocus,
    onBlur,
    value,
    ...rest
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const focus = useState(new Animated.Value(0))[0];

  const animate = useCallback(
    (to: number) => {
      Animated.timing(focus, {
        toValue: to,
        duration: 220,
        useNativeDriver: false,
      }).start();
    },
    [focus]
  );

  const handleFocus: NonNullable<TextInputProps['onFocus']> = useCallback(
    (e) => {
      setFocused(true);
      animate(1);
      onFocus?.(e);
    },
    [animate, onFocus]
  );

  const handleBlur: NonNullable<TextInputProps['onBlur']> = useCallback(
    (e) => {
      setFocused(false);
      animate(0);
      onBlur?.(e);
    },
    [animate, onBlur]
  );

  const hasValue = !!value && value.length > 0;
  const showLabel = !bare && !!label && (!focused || hasValue);
  const ringColor = error ? colors.danger : accentColor;

  const ringStyle = {
    borderColor: withAlpha(ringColor, focused || error ? 0.85 : 0.22),
    backgroundColor: withAlpha(ringColor, focused ? 0.14 : error ? 0.08 : 0.04),
  };

  const labelStyle = {
    color: error ? colors.danger : focused ? ringColor : colors.textMuted,
    transform: [{ scale: focused || hasValue ? 0.86 : 1 }],
  };

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={[styles.overline, { color: colors.textMuted }]}>{label}</Text>
      ) : null}

      <Animated.View
        style={[
          styles.field,
          bare && styles.fieldBare,
          { borderRadius: radii.md },
          ringStyle,
          error ? styles.fieldError : null,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={19}
            color={focused ? ringColor : colors.textMuted}
            style={styles.icon}
          />
        ) : null}

        <TextInput
          ref={ref}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !revealed}
          placeholderTextColor={colors.textFaint}
          selectionColor={ringColor}
          cursorColor={ringColor}
          accessibilityLabel={label ?? rest.placeholder}
          style={[
            styles.input,
            bare && styles.inputBare,
            { color: colors.text },
            inputStyle,
          ]}
          {...rest}
        />

        {secureTextEntry ? (
          <AnimatedPressable
            onPress={() => setRevealed((v) => !v)}
            style={styles.trailingBtn}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            hitSlop={8}
          >
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={19}
              color={colors.textMuted}
            />
          </AnimatedPressable>
        ) : (
          trailing
        )}
      </Animated.View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={13} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  overline: {
    ...typography.overline,
    marginBottom: 7,
    marginLeft: 4,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    paddingHorizontal: spacing.base,
    borderWidth: StyleSheet.hairlineWidth * 2,
    gap: 10,
  },
  fieldBare: {
    minHeight: 46,
    backgroundColor: colors.glass,
  },
  fieldError: {
    borderColor: withAlpha(colors.danger, 0.8),
  },
  icon: {
    marginRight: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: colors.text,
    // Web-only reset so the field inherits our transparent background.
    ...(({ outlineStyle: 'none' } as unknown) as object),
  },
  inputBare: {
    paddingVertical: 10,
    fontSize: 14.5,
  },
  trailingBtn: {
    padding: 4,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    flex: 1,
  },
});

export default GlassInput;
