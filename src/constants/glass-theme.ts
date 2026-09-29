/**
 * Glass + Purple UI Design Tokens
 * Shared across Login and all inner screens.
 * Complete Glassmorphism Design System for Campus Connect
 */
import { Platform } from 'react-native';

export const Glass = {
  // ==========================================
  // BACKGROUNDS - Deep Dark with Subtle Glass Layers
  // ==========================================
  bg: '#0A0010',                    // Deep void background
  bgElevated: '#0F0318',            // Slightly elevated surface
  bgLayer: 'rgba(255,255,255,0.07)', // Base glass layer
  bgCard: 'rgba(255,255,255,0.06)',  // Card glass
  bgCardHover: 'rgba(255,255,255,0.10)',
  bgCardPressed: 'rgba(255,255,255,0.14)',
  bgInput: 'rgba(255,255,255,0.06)',
  bgModal: 'rgba(10,0,16,0.95)',     // Modal backdrop
  bgModalCard: 'rgba(20,10,40,0.97)', // Modal card

  // ==========================================
  // BORDERS - Subtle Glass Edges
  // ==========================================
  border: 'rgba(255,255,255,0.10)',
  borderSubtle: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.18)',
  borderFocus: 'rgba(196,170,255,0.75)',
  borderActive: 'rgba(196,170,255,0.45)',
  borderPurple: 'rgba(196,170,255,0.3)',

  // ==========================================
  // PURPLES & ACCENTS - The Brand Gradient
  // ==========================================
  purple: '#C4AAFF',                // Primary purple
  purpleDim: 'rgba(196,170,255,0.15)',
  purpleLight: 'rgba(196,170,255,0.25)',
  purpleMed: 'rgba(196,170,255,0.4)',
  purpleBright: '#9B5CFF',          // Bright electric purple
  purplePink: '#FF4BA6',            // Pink accent
  purpleGrad: ['#9B5CFF', '#FF4BA6'] as [string, string],
  purpleGradSoft: ['rgba(155,92,255,0.8)', 'rgba(255,75,166,0.8)'] as [string, string],

  // Teal accent for success/active states
  teal: '#64DCC8',
  tealDim: 'rgba(100,220,200,0.15)',
  tealBright: '#4BE8C0',

  // Gold accent for warnings
  gold: '#FFB84B',
  goldDim: 'rgba(255,184,75,0.12)',

  // ==========================================
  // TEXT HIERARCHY
  // ==========================================
  text: '#FFFFFF',                  // Primary white
  textStrong: '#FFFFFF',            // High emphasis
  textSub: 'rgba(255,255,255,0.65)', // Secondary
  textMuted: 'rgba(255,255,255,0.4)', // Muted
  textDim: 'rgba(255,255,255,0.25)',  // Disabled/placeholder
  textPurple: '#C4AAFF',            // Purple accent text
  textPurpleDim: 'rgba(196,170,255,0.7)',
  textTeal: '#64DCC8',              // Teal accent text
  textGold: '#FFB84B',              // Gold accent text
  textDanger: '#FF6B6B',            // Danger text

  // ==========================================
  // STATUS COLORS with Glass Variants
  // ==========================================
  success: '#4BFF8E',
  successDim: 'rgba(75,255,142,0.12)',
  successBorder: 'rgba(75,255,142,0.3)',
  warning: '#FFB84B',
  warningDim: 'rgba(255,184,75,0.12)',
  warningBorder: 'rgba(255,184,75,0.3)',
  danger: '#FF6B6B',
  dangerDim: 'rgba(255,107,107,0.12)',
  dangerBorder: 'rgba(255,107,107,0.3)',
  info: '#4BB8FF',
  infoDim: 'rgba(75,184,255,0.12)',
  infoBorder: 'rgba(75,184,255,0.3)',

  // ==========================================
  // SHADOWS & GLOWS - Layered Depth
  // ==========================================
  // Card shadows - subtle depth
  cardShadow: Platform.select({
    web: { 
      boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset' 
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
  }),
  
  // Elevated card shadow
  cardShadowElevated: Platform.select({
    web: { 
      boxShadow: '0 12px 48px rgba(0,0,0,0.5), 0 2px 0 rgba(255,255,255,0.08) inset' 
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.45,
      shadowRadius: 28,
      elevation: 16,
    },
  }),

  // Purple glow for primary actions
  glowShadow: Platform.select({
    web: { boxShadow: '0 0 32px rgba(196,170,255,0.35), 0 0 64px rgba(196,170,255,0.15)' },
    default: {
      shadowColor: '#C4AAFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
    },
  }),

  // Button shadow with purple glow
  btnShadow: Platform.select({
    web: { 
      boxShadow: '0 6px 24px rgba(155,92,255,0.5), 0 2px 8px rgba(255,75,166,0.3)' 
    },
    default: {
      shadowColor: '#9B5CFF',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 18,
      elevation: 10,
    },
  }),

  // Subtle inner glow for focused inputs
  innerGlow: Platform.select({
    web: { boxShadow: 'inset 0 0 0 1px rgba(196,170,255,0.5), inset 0 0 16px rgba(196,170,255,0.1)' },
    default: {},
  }),

  // ==========================================
  // BLUR / BACKDROP FILTER VALUES
  // ==========================================
  blur: {
    light: Platform.select({ web: 'blur(8px)', default: null }),
    medium: Platform.select({ web: 'blur(20px)', default: null }),
    heavy: Platform.select({ web: 'blur(40px)', default: null }),
    intense: Platform.select({ web: 'blur(60px)', default: null }),
  },

  // ==========================================
  // SPACING SCALE
  // ==========================================
  space: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // ==========================================
  // BORDER RADIUS
  // ==========================================
  radius: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
    pill: 9999,
    circle: 9999,
  },

  // ==========================================
  // TYPOGRAPHY SCALE
  // ==========================================
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },

  // ==========================================
  // ANIMATION TIMING
  // ==========================================
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
    spring: { tension: 65, friction: 9 },
    springGentle: { tension: 50, friction: 10 },
  },

  // ==========================================
  // Z-INDEX LAYERS
  // ==========================================
  zIndex: {
    base: 0,
    card: 10,
    floating: 100,
    sticky: 200,
    modal: 1000,
    toast: 2000,
    overlay: 500,
  },

  // ==========================================
  // LAYOUT CONSTRAINTS
  // ==========================================
  maxContentWidth: 600,
  screenPadding: 20,
  cardPadding: 20,
};

export type GlassTheme = typeof Glass;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Create a glass card style object
 */
export const createGlassCard = (elevated = false) => ({
  backgroundColor: Glass.bgCard,
  borderRadius: Glass.radius.xl,
  borderWidth: 1,
  borderColor: Glass.border,
  padding: Glass.space.md,
  ...(elevated ? Glass.cardShadowElevated : Glass.cardShadow),
});

/**
 * Create a glass input style object
 */
export const createGlassInput = (focused = false) => ({
  backgroundColor: focused ? Glass.purpleDim : Glass.bgInput,
  borderRadius: Glass.radius.md,
  borderWidth: focused ? 1.5 : 1,
  borderColor: focused ? Glass.borderFocus : Glass.border,
  paddingHorizontal: Glass.space.md,
  paddingVertical: Glass.space.sm,
  minHeight: 52,
  color: Glass.text,
  ...(focused ? Glass.innerGlow : {}),
});

/**
 * Create a glass button style object
 */
export const createGlassButton = (variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary') => {
  const base = {
    borderRadius: Glass.radius.md,
    paddingVertical: Glass.space.sm,
    paddingHorizontal: Glass.space.lg,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: Glass.space.sm,
  };

  switch (variant) {
    case 'primary':
      return {
        ...base,
        backgroundColor: Glass.purpleBright,
        ...Glass.btnShadow,
      };
    case 'secondary':
      return {
        ...base,
        backgroundColor: Glass.bgCard,
        borderWidth: 1,
        borderColor: Glass.borderPurple,
      };
    case 'ghost':
      return {
        ...base,
        backgroundColor: 'transparent',
      };
    case 'danger':
      return {
        ...base,
        backgroundColor: Glass.danger,
        ...Platform.select({
          web: { boxShadow: '0 6px 24px rgba(255,107,107,0.4)' },
          default: {
            shadowColor: Glass.danger,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 18,
            elevation: 10,
          },
        }),
      };
  }
};

/**
 * Create gradient background styles for web
 */
export const createGradient = (colors: [string, string], angle = 135) => 
  Platform.select({
    web: {
      background: `linear-gradient(${angle}deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
    },
    default: {
      backgroundColor: colors[0],
    },
  });

/**
 * Glass badge style
 */
export const createGlassBadge = (variant: 'purple' | 'teal' | 'gold' | 'danger' = 'purple') => {
  const base = {
    paddingHorizontal: Glass.space.sm,
    paddingVertical: 2,
    borderRadius: Glass.radius.pill,
    borderWidth: 1,
  };

  const variants = {
    purple: { backgroundColor: Glass.purpleDim, borderColor: Glass.borderPurple },
    teal: { backgroundColor: Glass.tealDim, borderColor: Glass.successBorder },
    gold: { backgroundColor: Glass.goldDim, borderColor: Glass.warningBorder },
    danger: { backgroundColor: Glass.dangerDim, borderColor: Glass.dangerBorder },
  };

  return { ...base, ...variants[variant] };
};