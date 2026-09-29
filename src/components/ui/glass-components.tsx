/**
 * Glass UI Components - Reusable Glassmorphism Components
 * Complete design system for Campus Connect glass UI
 */
import { Glass, createGlassBadge, createGlassButton, createGlassCard } from '@/constants/glass-theme';
import { Ionicons } from '@expo/vector-icons';
import {
    GlassView as NativeGlassView,
    isGlassEffectAPIAvailable,
    isLiquidGlassAvailable,
} from 'expo-glass-effect';
import React, { forwardRef } from 'react';
import {
    Animated, Platform, Pressable,
    PressableProps, StyleProp, StyleSheet, Text,
    TextInput,
    TextInputProps, View,
    ViewProps,
    ViewStyle
} from 'react-native';

const supportsLiquidGlass =
  Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

const createGradient = (colors: [string, string]) => Platform.select({
  web: { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` },
  default: { backgroundColor: colors[0] },
});

// ==========================================
// GLASS VIEW - Base glass container
// ==========================================
export interface GlassViewProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'subtle' | 'modal';
  blur?: 'light' | 'medium' | 'heavy' | 'intense';
  padding?: number;
  children: React.ReactNode;
}

export const GlassView = forwardRef<View, GlassViewProps>(
  ({ variant = 'default', blur = 'medium', padding, children, style, ...props }, ref) => {
    const baseStyle = {
      ...createGlassCard(variant === 'elevated'),
      ...(supportsLiquidGlass && { backgroundColor: 'transparent' }),
    };
    const variantStyles: Record<string, ViewStyle> = {
      default: {},
      elevated: { ...Glass.cardShadowElevated },
      subtle: {
        backgroundColor: Glass.bgLayer,
        borderColor: Glass.borderSubtle,
      },
      modal: {
        backgroundColor: Glass.bgModalCard,
        borderColor: Glass.borderStrong,
        ...Glass.cardShadowElevated,
      },
    };

    const blurStyle = Platform.select({
      web: { backdropFilter: Glass.blur[blur], WebkitBackdropFilter: Glass.blur[blur] },
      default: {},
    });

    return (
      <View
        ref={ref}
        style={[
          baseStyle,
          variantStyles[variant],
          blurStyle,
          { padding: padding ?? Glass.space.md },
          style,
        ]}
        {...props}
      >
        {supportsLiquidGlass && (
          <NativeGlassView
            pointerEvents="none"
            glassEffectStyle="regular"
            colorScheme="dark"
            tintColor={variant === 'modal' ? 'rgba(24,30,36,0.48)' : 'rgba(255,255,255,0.07)'}
            style={[StyleSheet.absoluteFill, { borderRadius: Glass.radius.xl }]}
          />
        )}
        {children}
      </View>
    );
  }
);

GlassView.displayName = 'GlassView';

// ==========================================
// GLASS CARD - Content card with glass effect
// ==========================================
export interface GlassCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'interactive' | 'hero';
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const GlassCard = forwardRef<View, GlassCardProps>(
  ({ variant = 'default', onPress, children, style, ...props }, ref) => {
    const baseStyle = {
      ...createGlassCard(variant === 'elevated' || variant === 'hero'),
      ...(supportsLiquidGlass && { backgroundColor: 'transparent' }),
    };
    
    const variantStyles: Record<string, ViewStyle> = {
      default: {},
      elevated: { ...Glass.cardShadowElevated },
      interactive: {
        ...Glass.cardShadow,
      },
      hero: {
        ...Glass.cardShadowElevated,
        borderColor: Glass.borderPurple,
        backgroundColor: Glass.purpleDim,
      },
    };

    const blurStyle = Platform.select({
      web: { backdropFilter: Glass.blur.heavy, WebkitBackdropFilter: Glass.blur.heavy },
      default: {},
    });

    const Component = onPress ? Pressable : View;
    const pressStyles = onPress 
      ? ({ pressed }: { pressed: boolean }) => [
          style,
          pressed && { 
            opacity: 0.9,
            transform: [{ scale: 0.98 }],
            backgroundColor: Glass.bgCardPressed,
          },
        ]
      : style;

    return (
      <Component
        ref={ref}
        style={[
          baseStyle,
          variantStyles[variant],
          blurStyle,
          pressStyles,
        ]}
        onPress={onPress}
        {...props}
      >
        {supportsLiquidGlass && (
          <NativeGlassView
            pointerEvents="none"
            glassEffectStyle="regular"
            colorScheme="dark"
            tintColor={variant === 'hero' ? 'rgba(155,92,255,0.16)' : 'rgba(255,255,255,0.07)'}
            style={[StyleSheet.absoluteFill, { borderRadius: Glass.radius.xl }]}
          />
        )}
        {children}
      </Component>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// ==========================================
// GLASS INPUT - Text input with glass styling
// ==========================================
export interface GlassInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  iconColor?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const GlassInput = forwardRef<TextInput, GlassInputProps>(
  ({ label, icon, error, iconColor, leftElement, rightElement, style, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const focusAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      Animated.timing(focusAnim, {
        toValue: focused ? 1 : 0,
        duration: Glass.animation.fast,
        useNativeDriver: false,
      }).start();
    }, [focused, focusAnim]);

    const borderColor = focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [error ? Glass.dangerBorder : Glass.border, error ? Glass.danger : Glass.borderFocus],
    });
    
    const bgColor = focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [Glass.bgInput, Glass.purpleDim],
    });

    const labelColor = focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [Glass.textMuted, Glass.purple],
    });

    return (
      <View style={{ gap: Glass.space.xs, width: '100%' }}>
        {label && (
          <Animated.Text
            style={[
              styles.inputLabel,
              { color: labelColor },
            ]}
          >
            {label}
          </Animated.Text>
        )}
        <Animated.View
          style={[
            styles.inputWrapper,
            { borderColor, backgroundColor: bgColor },
            style,
          ]}
        >
          {(leftElement || icon) && (
            <View style={styles.inputIcon}>
              {leftElement || icon}
            </View>
          )}
          <TextInput
            ref={ref}
            style={[
              styles.inputText,
              { color: Glass.text, placeholderTextColor: Glass.textDim },
            ]}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            selectionColor={Glass.purple}
            {...props}
          />
          {rightElement && (
            <View style={styles.inputIcon}>{rightElement}</View>
          )}
        </Animated.View>
        {error && (
          <Animated.Text
            style={[
              styles.inputError,
              { opacity: focusAnim },
            ]}
          >
            {error}
          </Animated.Text>
        )}
      </View>
    );
  }
);

GlassInput.displayName = 'GlassInput';

// ==========================================
// GLASS BUTTON - Primary, secondary, ghost variants
// ==========================================
export interface GlassButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const GlassButton = forwardRef<Pressable, GlassButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    style,
    disabled,
    onPress,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    const sizeStyles: Record<string, ViewStyle> = {
      sm: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: Glass.radius.sm, gap: 6 },
      md: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: Glass.radius.md, gap: 8 },
      lg: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: Glass.radius.lg, gap: 10 },
      xl: { paddingVertical: 20, paddingHorizontal: 32, borderRadius: Glass.radius.xl, gap: 12 },
    };

    const variantStyles = createGlassButton(variant);
    const gradientStyle = variant === 'gradient' ? Glass.purpleGrad : null;

    const textColor = variant === 'primary' || variant === 'danger' || variant === 'gradient'
      ? Glass.text
      : variant === 'secondary'
      ? Glass.purple
      : Glass.textSub;

    return (
      <Pressable
        ref={ref}
        style={({ pressed }) => [
          styles.buttonBase,
          sizeStyles[size],
          variantStyles,
          gradientStyle ? createGradient(Glass.purpleGrad) : {},
          fullWidth && { width: '100%' },
          {
            opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1,
            transform: pressed && !isDisabled ? [{ scale: 0.97 }] : [],
          },
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        {...props}
      >
        {loading ? (
          <Animated.View style={styles.spinner} />
        ) : (
          <>
            {leftIcon && <View>{leftIcon}</View>}
            <Text style={[styles.buttonText, { color: textColor, fontSize: size === 'sm' ? Glass.fontSize.sm : size === 'lg' ? Glass.fontSize.lg : size === 'xl' ? Glass.fontSize.xl : Glass.fontSize.md }]}>
              {children}
            </Text>
            {rightIcon && <View>{rightIcon}</View>}
          </>
        )}
      </Pressable>
    );
  }
);

GlassButton.displayName = 'GlassButton';

// ==========================================
// GLASS BADGE - Status/badge component
// ==========================================
export interface GlassBadgeProps {
  variant?: 'purple' | 'teal' | 'gold' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  dot?: boolean;
}

export const GlassBadge = ({ variant = 'purple', size = 'md', children, style, dot }: GlassBadgeProps) => {
  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Glass.radius.pill, gap: 4 },
    md: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Glass.radius.pill, gap: 5 },
    lg: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: Glass.radius.pill, gap: 6 },
  };

  const badgeStyle = createGlassBadge(variant);
  const dotColors: Record<string, string> = {
    purple: Glass.purple,
    teal: Glass.teal,
    gold: Glass.gold,
    danger: Glass.danger,
    info: Glass.info,
  };

  return (
    <View style={[styles.badgeBase, badgeStyle, sizeStyles[size], style]}>
      {dot && <View style={[styles.badgeDot, { backgroundColor: dotColors[variant] }]} />}
      <Text style={[styles.badgeText, { color: variant === 'purple' ? Glass.purple : variant === 'teal' ? Glass.teal : variant === 'gold' ? Glass.gold : variant === 'danger' ? Glass.danger : Glass.info }]}>
        {children}
      </Text>
    </View>
  );
};

// ==========================================
// GLASS PILL - Filter/tab pill
// ==========================================
export interface GlassPillProps extends PressableProps {
  selected?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'purple' | 'teal';
}

export const GlassPill = forwardRef<Pressable, GlassPillProps>(
  ({ selected = false, children, variant = 'default', style, ...props }, ref) => {
    const baseStyle = {
      paddingHorizontal: Glass.space.md,
      paddingVertical: Glass.space.xs,
      borderRadius: Glass.radius.pill,
      borderWidth: 1,
    };

    const variantStyles = selected
      ? variant === 'purple'
        ? { backgroundColor: Glass.purpleBright, borderColor: Glass.purpleBright }
        : variant === 'teal'
        ? { backgroundColor: Glass.teal, borderColor: Glass.teal }
        : { backgroundColor: Glass.purpleBright, borderColor: Glass.purpleBright }
      : {
          backgroundColor: Glass.bgCard,
          borderColor: Glass.border,
        };

    const textColor = selected ? Glass.text : Glass.textSub;

    return (
      <Pressable
        ref={ref}
        style={[{ pressed: { opacity: 0.8 } }, baseStyle, variantStyles, style]}
        {...props}
      >
        <Text style={[styles.pillText, { color: textColor }]}>{children}</Text>
      </Pressable>
    );
  }
);

GlassPill.displayName = 'GlassPill';

// ==========================================
// GLASS AVATAR - User avatar with glass ring
// ==========================================
export interface GlassAvatarProps {
  source?: { uri: string } | number;
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
  ringColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const GlassAvatar = ({
  source,
  initials,
  size = 'md',
  ring = true,
  ringColor = Glass.purple,
  style,
}: GlassAvatarProps) => {
  const sizeMap: Record<string, number> = {
    xs: 28,
    sm: 36,
    md: 44,
    lg: 56,
    xl: 72,
  };
  const diameter = sizeMap[size];
  const fontSize = diameter * 0.35;

  return (
    <View style={[{ width: diameter, height: diameter }, style]}>
      {ring && (
        <View
          style={[
            styles.avatarRing,
            { width: diameter, height: diameter, borderColor: ringColor },
          ]}
        />
      )}
      <View style={styles.avatarContainer}>
        {source ? (
          <View style={[{ width: diameter, height: diameter, borderRadius: Glass.radius.circle, overflow: 'hidden' }]}>
            {/* Image would go here - using placeholder for now */}
            <View style={styles.avatarPlaceholder}>
              <Text style={{ fontSize, fontWeight: '700', color: Glass.purple }}>
                {initials || '?'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={{ fontSize, fontWeight: '700', color: Glass.purple }}>
              {initials || '?'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// ==========================================
// GLASS MODAL - Modal with glass backdrop
// ==========================================
export interface GlassModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  backdropOpacity?: number;
}

export const GlassModal = ({ visible, onClose, children, size = 'md', backdropOpacity = 0.75 }: GlassModalProps) => {
  if (!visible) return null;

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { maxWidth: 320, width: '90%' },
    md: { maxWidth: 440, width: '90%' },
    lg: { maxWidth: 560, width: '95%' },
    full: { maxWidth: '100%', width: '100%', height: '100%', borderRadius: 0 },
  };

  return (
    <View style={styles.modalOverlay} accessibilityViewIsModal accessible>
      <Animated.View
        style={[
          styles.modalBackdrop,
          { backgroundColor: `rgba(0,0,0,${backdropOpacity})` },
        ]}
        onStartShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onPress={onClose}
      />
      <View
        style={[
          styles.modalCard,
          createGlassCard(true),
          { borderColor: Glass.borderStrong },
          sizeStyles[size],
        ]}
      >
        {children}
      </View>
    </View>
  );
};

// ==========================================
// GLASS DIVIDER
// ==========================================
export interface GlassDividerProps {
  style?: StyleProp<ViewStyle>;
  label?: string;
}

export const GlassDivider = ({ style, label }: GlassDividerProps) => {
  if (label) {
    return (
      <View style={[styles.dividerWithLabel, style]}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>{label}</Text>
        <View style={styles.dividerLine} />
      </View>
    );
  }
  return <View style={[styles.dividerLine, style]} />;
};

// ==========================================
// GLASS SECTION HEADER
// ==========================================
export interface GlassSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const GlassSectionHeader = ({ title, subtitle, action, style }: GlassSectionHeaderProps) => (
  <View style={[styles.sectionHeader, style]}>
    <View style={styles.sectionHeaderLeft}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {action && <View style={styles.sectionAction}>{action}</View>}
  </View>
);

// ==========================================
// GLASS LIST ITEM - Standardized list row
// ==========================================
export interface GlassListItemProps extends PressableProps {
  left?: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  badge?: string;
  badgeVariant?: 'purple' | 'teal' | 'gold' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export const GlassListItem = forwardRef<Pressable, GlassListItemProps>(
  ({ left, title, subtitle, right, badge, badgeVariant = 'purple', style, ...props }, ref) => (
    <Pressable
      ref={ref}
      style={({ pressed }) => [
        styles.listItem,
        { backgroundColor: pressed ? Glass.bgCardHover : Glass.bgCard },
        style,
      ]}
      {...props}
    >
      {left && <View style={styles.listItemLeft}>{left}</View>}
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.listItemSubtitle}>{subtitle}</Text>}
      </View>
      {badge && <GlassBadge variant={badgeVariant} size="sm">{badge}</GlassBadge>}
      {right && <View style={styles.listItemRight}>{right}</View>}
    </Pressable>
  )
);

GlassListItem.displayName = 'GlassListItem';

// ==========================================
// GLASS PROGRESS STEPPER - Order tracking
// ==========================================
export interface GlassStepperProps {
  steps: { label: string; icon?: React.ReactNode }[];
  activeIndex: number;
  completedColor?: string;
  inactiveColor?: string;
  lineColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const GlassStepper = ({
  steps,
  activeIndex,
  completedColor = Glass.purple,
  inactiveColor = Glass.textDim,
  lineColor = Glass.border,
  style,
}: GlassStepperProps) => (
  <View style={[styles.stepperContainer, style]}>
    {steps.map((step, index) => (
      <View key={index} style={styles.stepperItem}>
        <View style={styles.stepperCircleWrapper}>
          <View
            style={[
              styles.stepperCircle,
              index < activeIndex
                ? { backgroundColor: completedColor, borderColor: completedColor }
                : index === activeIndex
                ? { backgroundColor: 'transparent', borderColor: completedColor, borderWidth: 2 }
                : { backgroundColor: Glass.bgCard, borderColor: inactiveColor },
            ]}
          >
            {index < activeIndex && (
              <Ionicons name="checkmark" size={12} color={Glass.bg} style={styles.stepperCheck} />
            )}
            {index === activeIndex && (
              <View style={[styles.stepperDot, { backgroundColor: completedColor }]} />
            )}
            {index > activeIndex && (
              <View style={[styles.stepperDot, { backgroundColor: inactiveColor }]} />
            )}
          </View>
        </View>
        <Text
          style={[
            styles.stepperLabel,
            {
              color: index <= activeIndex ? Glass.text : inactiveColor,
              fontWeight: index <= activeIndex ? '700' : '500',
            },
          ]}
        >
          {step.label}
        </Text>
        {index < steps.length - 1 && (
          <View
            style={[
              styles.stepperLine,
              { backgroundColor: index < activeIndex ? completedColor : lineColor },
            ]}
          />
        )}
      </View>
    ))}
  </View>
);

// ==========================================
// GLASS SEARCH BAR
// ==========================================
export interface GlassSearchBarProps extends Omit<TextInputProps, 'style'> {
  placeholder?: string;
  onClear?: () => void;
  onFilter?: () => void;
  showFilter?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const GlassSearchBar = ({
  placeholder = 'Search...',
  onClear,
  onFilter,
  showFilter = false,
  style,
  value,
  onChangeText,
  ...props
}: GlassSearchBarProps) => {
  const [focused, setFocused] = React.useState(false);
  const [text, setText] = React.useState(value || '');

  React.useEffect(() => {
    setText(value || '');
  }, [value]);

  const handleChange = (newText: string) => {
    setText(newText);
    onChangeText?.(newText);
  };

  return (
    <Animated.View style={[styles.searchBar, { borderColor: focused ? Glass.borderFocus : Glass.border }, style]}>
      <Ionicons name="search" size={20} color={focused ? Glass.purple : Glass.textMuted} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={Glass.textDim}
        value={text}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {text && onClear ? (
        <Pressable onPress={onClear} style={styles.searchClear}>
          <Ionicons name="close-circle" size={18} color={Glass.textMuted} />
        </Pressable>
      ) : showFilter && onFilter ? (
        <Pressable onPress={onFilter} style={styles.searchFilter}>
          <Ionicons name="options-outline" size={18} color={Glass.purple} />
        </Pressable>
      ) : null}
    </Animated.View>
  );
};

// ==========================================
// GLASS FLOATING ACTION BUTTON
// ==========================================
export interface GlassFABProps extends PressableProps {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'teal' | 'pink';
  style?: StyleProp<ViewStyle>;
}

export const GlassFAB = ({ icon, size = 'md', variant = 'primary', style, ...props }: GlassFABProps) => {
  const sizeMap: Record<string, { size: number; iconSize: number }> = {
    sm: { size: 44, iconSize: 18 },
    md: { size: 56, iconSize: 24 },
    lg: { size: 68, iconSize: 28 },
  };

  const { size: fabSize, iconSize } = sizeMap[size];
  const variantColors: Record<string, string> = {
    primary: Glass.purpleBright,
    teal: Glass.teal,
    pink: Glass.purplePink,
  };

  const bgColor = variantColors[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        { width: fabSize, height: fabSize },
        { backgroundColor: bgColor },
        pressed && { transform: [{ scale: 0.92 }] },
        style,
      ]}
      {...props}
    >
      <View style={{ width: iconSize, height: iconSize }}>{icon}</View>
    </Pressable>
  );
};

// ==========================================
// GLASS ALERT / TOAST
// ==========================================
export interface GlassAlertProps {
  variant: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const GlassAlert = ({ variant, title, message, action, onDismiss, style }: GlassAlertProps) => {
  const variantStyles: Record<string, { bg: string; border: string; iconColor: string; textColor: string }> = {
    info: { bg: Glass.infoDim, border: Glass.infoBorder, iconColor: Glass.info, textColor: Glass.text },
    success: { bg: Glass.successDim, border: Glass.successBorder, iconColor: Glass.success, textColor: Glass.text },
    warning: { bg: Glass.goldDim, border: Glass.warningBorder, iconColor: Glass.gold, textColor: Glass.text },
    danger: { bg: Glass.dangerDim, border: Glass.dangerBorder, iconColor: Glass.danger, textColor: Glass.text },
  };

  const v = variantStyles[variant];
  const icons: Record<string, string> = {
    info: 'information-circle',
    success: 'checkmark-circle',
    warning: 'alert-circle',
    danger: 'close-circle',
  };

  return (
    <View style={[styles.alert, { backgroundColor: v.bg, borderColor: v.border }, style]}>
      <View style={styles.alertContent}>
        <Ionicons name={icons[variant]} size={20} color={v.iconColor} />
        <View style={styles.alertText}>
          <Text style={[styles.alertTitle, { color: v.textColor }]}>{title}</Text>
          {message && <Text style={[styles.alertMessage, { color: v.textColor }]}>{message}</Text>}
        </View>
      </View>
      {action && (
        <Pressable style={styles.alertAction} onPress={action.onPress}>
          <Text style={styles.alertActionText}>{action.label}</Text>
        </Pressable>
      )}
      {onDismiss && (
        <Pressable onPress={onDismiss} style={styles.alertDismiss}>
          <Ionicons name="close" size={18} color={Glass.textMuted} />
        </Pressable>
      )}
    </View>
  );
};

// ==========================================
// GLASS TAB BAR ITEM
// ==========================================
export interface GlassTabItemProps {
  focused: boolean;
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
  onPress: () => void;
}

export const GlassTabItem = ({ focused, icon, label, badge, onPress }: GlassTabItemProps) => (
  <Pressable style={styles.tabItem} onPress={onPress} accessibilityRole="tab" accessibilitySelected={focused}>
    <View style={[styles.tabIconWrapper, focused && styles.tabIconFocused]}>
      {icon}
    </View>
    <Text style={[styles.tabLabel, focused ? styles.tabLabelFocused : {}]}>{label}</Text>
    {badge && (
      <View style={styles.tabBadge}>
        <Text style={styles.tabBadgeText}>{badge}</Text>
      </View>
    )}
  </Pressable>
);

// ==========================================
// GLASS HEADER - Screen header with glass effect
// ==========================================
export interface GlassHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const GlassHeader = ({ title, subtitle, leftAction, rightAction, style }: GlassHeaderProps) => (
  <View style={[styles.glassHeader, createGlassCard(false), { borderBottomWidth: 1, borderBottomColor: Glass.border }, style]}>
    <View style={styles.headerContent}>
      {leftAction && <View style={styles.headerLeft}>{leftAction}</View>}
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      {rightAction && <View style={styles.headerRight}>{rightAction}</View>}
    </View>
  </View>
);

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  // Input
  inputLabel: {
    fontSize: Glass.fontSize.xs,
    fontWeight: Glass.fontWeight.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Glass.radius.md,
    paddingHorizontal: Glass.space.md,
    minHeight: 52,
    gap: Glass.space.sm,
  },
  inputIcon: { paddingHorizontal: Glass.space.xs },
  inputText: { flex: 1, fontSize: Glass.fontSize.md, fontWeight: Glass.fontWeight.medium },
  inputError: { fontSize: Glass.fontSize.xs, color: Glass.danger, marginLeft: Glass.space.xs },

  // Button
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    fontWeight: Glass.fontWeight.extrabold,
    letterSpacing: 0.3,
  },
  spinner: { width: 20, height: 20 },

  // Badge
  badgeBase: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: Glass.fontSize.xs, fontWeight: Glass.fontWeight.extrabold, letterSpacing: 0.3 },

  // Pill
  pillText: { fontSize: Glass.fontSize.sm, fontWeight: Glass.fontWeight.bold },

  // Modal
  modalOverlay: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center', padding: Glass.space.md },
  modalBackdrop: { ...StyleSheet.absoluteFill },
  modalCard: { borderRadius: Glass.radius.xxl, padding: Glass.space.lg, maxHeight: '90%' },

  // Divider
  dividerLine: { flex: 1, height: 1, backgroundColor: Glass.border },
  dividerWithLabel: { flexDirection: 'row', alignItems: 'center', gap: Glass.space.md, marginVertical: Glass.space.md },
  dividerLabel: { fontSize: Glass.fontSize.xs, color: Glass.textDim, fontWeight: Glass.fontWeight.semibold, letterSpacing: 0.5 },

  // Section Header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Glass.space.md },
  sectionHeaderLeft: { flex: 1 },
  sectionTitle: { fontSize: Glass.fontSize.xxl, fontWeight: Glass.fontWeight.extrabold, color: Glass.text },
  sectionSubtitle: { fontSize: Glass.fontSize.sm, color: Glass.textMuted, marginTop: 2 },
  sectionAction: {},

  // List Item
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Glass.space.md, paddingHorizontal: Glass.space.md, borderRadius: Glass.radius.md, gap: Glass.space.md },
  listItemLeft: { width: 44, height: 44, borderRadius: Glass.radius.sm, backgroundColor: Glass.purpleDim, alignItems: 'center', justifyContent: 'center' },
  listItemContent: { flex: 1, minWidth: 0 },
  listItemTitle: { fontSize: Glass.fontSize.md, fontWeight: Glass.fontWeight.bold, color: Glass.text },
  listItemSubtitle: { fontSize: Glass.fontSize.sm, color: Glass.textMuted, marginTop: 1 },
  listItemRight: { alignItems: 'flex-end' },

  // Stepper
  stepperContainer: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: Glass.space.xs },
  stepperItem: { alignItems: 'center', flex: 1 },
  stepperCircleWrapper: { marginBottom: Glass.space.xs },
  stepperCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  stepperCheck: {},
  stepperDot: { width: 6, height: 6, borderRadius: 3 },
  stepperLine: { flex: 1, height: 2, marginHorizontal: Glass.space.xs, marginBottom: 18 },
  stepperLabel: { fontSize: Glass.fontSize.xs, textAlign: 'center', fontWeight: Glass.fontWeight.semibold },

  // Search Bar
  searchBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Glass.radius.lg, paddingHorizontal: Glass.space.md, height: 54, backgroundColor: Glass.bgInput, gap: Glass.space.sm },
  searchIcon: { marginRight: Glass.space.xs },
  searchInput: { flex: 1, fontSize: Glass.fontSize.md, color: Glass.text },
  searchClear: { padding: Glass.space.xs },
  searchFilter: { padding: Glass.space.xs },

  // FAB
  fab: { borderRadius: Glass.radius.circle, alignItems: 'center', justifyContent: 'center', ...Glass.btnShadow },

  // Alert
  alert: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: Glass.radius.md, padding: Glass.space.md, borderWidth: 1, gap: Glass.space.md },
  alertContent: { flex: 1, flexDirection: 'row', gap: Glass.space.md },
  alertText: { flex: 1 },
  alertTitle: { fontSize: Glass.fontSize.md, fontWeight: Glass.fontWeight.bold },
  alertMessage: { fontSize: Glass.fontSize.sm, marginTop: 2, lineHeight: 18 },
  alertAction: { paddingHorizontal: Glass.space.md, paddingVertical: Glass.space.xs, borderRadius: Glass.radius.sm, backgroundColor: Glass.bgCard, borderWidth: 1, borderColor: Glass.border },
  alertActionText: { fontSize: Glass.fontSize.sm, fontWeight: Glass.fontWeight.bold, color: Glass.purple },
  alertDismiss: { padding: Glass.space.xs },

  // Tab Item
  tabItem: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: Glass.space.xs },
  tabIconWrapper: { width: 40, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tabIconFocused: { backgroundColor: Glass.purpleDim },
  tabLabel: { fontSize: 10, fontWeight: '700', color: Glass.textMuted },
  tabLabelFocused: { color: Glass.purple },
  tabBadge: { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: Glass.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabBadgeText: { fontSize: 9, fontWeight: '800', color: Glass.text },

  // Glass Header
  glassHeader: { paddingHorizontal: Glass.space.md, paddingVertical: Glass.space.md },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { width: 44 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerRight: { width: 44, alignItems: 'flex-end' },
  headerTitle: { fontSize: Glass.fontSize.lg, fontWeight: Glass.fontWeight.extrabold, color: Glass.text },
  headerSubtitle: { fontSize: Glass.fontSize.xs, color: Glass.textMuted, marginTop: 1 },

  // Avatar
  avatarRing: { position: 'absolute', borderRadius: Glass.radius.circle, borderWidth: 2, opacity: 0.5 },
  avatarContainer: { width: '100%', height: '100%', borderRadius: Glass.radius.circle, backgroundColor: Glass.bgCard, borderWidth: 1, borderColor: Glass.border, alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
});