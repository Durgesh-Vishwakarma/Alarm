/**
 * SnapWake Design Tokens
 * Shared design language for spacing, typography, cards, gradients, motion, and shadows.
 */

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  giant: 32,
  huge: 40,
  massive: 48,
};

const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 28,
  xxl: 36,
  giant: 36,
  full: 9999,
};

const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 7,
  },
  glow: {
    shadowColor: "#FF7A18",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 8,
  },
};

const gradients = {
  primary: ["#FF8A2A", "#FF6A00"],
  heroDark: ["#FF7A18", "#E85D00", "#38206B"],
  heroIdle: ["#1E293B", "#0F172A", "#020617"],
  surface: ["#1E293B", "#0F172A"],
  midnight: ["#0F172A", "#020617"],
  success: ["#10B981", "#059669"],
  glass: ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"],
  glassDark: ["rgba(255,255,255,0.08)", "rgba(15,23,42,0.22)"],
  glassLight: ["rgba(255,255,255,0.62)", "rgba(241,245,249,0.42)"],
};

const animation = {
  duration: {
    fast: 200,
    normal: 350,
    slow: 500,
  },
  easing: {
    out: [0.22, 1, 0.36, 1],
    inOut: [0.65, 0, 0.35, 1],
  },
  stagger: 40,
  pressScale: 0.97,
  spring: {
    damping: 20,
    stiffness: 180,
    mass: 1,
  },
  layout: {
    subtle: { damping: 25, stiffness: 100 },
  },
};

export const tokens = {
  colors: {
    primary: "#FF7A18",
    primaryLight: "#FFB547",
    primaryDark: "#E85D00",
    accent: "#10B981",
    accentLight: "#34D399",
    background: "#020617",
    surface: "#0F172A",
    surfaceElevated: "#1E293B",
    surfaceGlass: "rgba(15, 23, 42, 0.82)",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    textDisabled: "#334155",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    border: "rgba(248, 250, 252, 0.08)",
    divider: "rgba(248, 250, 252, 0.04)",
    glowPrimary: "rgba(255, 122, 24, 0.18)",
    glowSuccess: "rgba(16, 185, 129, 0.14)",
    shadowSoft: "rgba(0, 0, 0, 0.32)",
  },
  spacing,
  radius,
  shadows,
  typography: {
    fontFamily: {
      display: "Outfit-ExtraBold",
      title: "Outfit-Bold",
      body: "Outfit-Medium",
      caption: "Outfit-Medium",

      // Legacy aliases used across existing screens.
      hero: "Outfit-ExtraBold",
      section: "Outfit-Bold",
      card: "Outfit-SemiBold",
      metadata: "Outfit-Medium",
    },
    size: {
      displayLarge: 72,
      displayMedium: 64,
      titleLarge: 32,
      titleMedium: 20,
      body: 16,
      caption: 12,

      // Legacy aliases used across existing screens.
      hero: 72,
      section: 32,
      card: 20,
      metadata: 12,
      tiny: 11,
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.4,
      relaxed: 1.6,
    },
    styles: {
      displayLarge: {
        fontFamily: "Outfit-ExtraBold",
        fontSize: 72,
        lineHeight: 78,
        letterSpacing: -3,
      },
      displayMedium: {
        fontFamily: "Outfit-ExtraBold",
        fontSize: 64,
        lineHeight: 70,
        letterSpacing: -2.5,
      },
      titleLarge: {
        fontFamily: "Outfit-Bold",
        fontSize: 32,
        lineHeight: 38,
        letterSpacing: -1,
      },
      titleMedium: {
        fontFamily: "Outfit-SemiBold",
        fontSize: 20,
        lineHeight: 26,
        letterSpacing: -0.4,
      },
      body: {
        fontFamily: "Outfit-Medium",
        fontSize: 16,
        lineHeight: 23,
        letterSpacing: 0,
      },
      caption: {
        fontFamily: "Outfit-Medium",
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 0,
      },
    },
  },
  animation,
  haptics: {
    selection: "selection",
    success: "success",
    warning: "warning",
    error: "error",
    impact: {
      light: "light",
      medium: "medium",
      heavy: "heavy",
    },
  },
  glass: {
    light: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.15)",
      borderWidth: 1,
    },
    dark: {
      backgroundColor: "rgba(15, 23, 42, 0.68)",
      borderColor: "rgba(248, 250, 252, 0.08)",
      borderWidth: 1,
    },
  },
  gradients,
};
