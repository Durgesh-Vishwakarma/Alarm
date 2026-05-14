/**
 * SnapWake Design Tokens
 * Phase 1-7: Foundation & UI
 * Phase 8: Micro-Interactions & Lighting System
 */

export const tokens = {
  colors: {
    // Brand — warm orange (reference UI)
    primary: "#FF7A18",
    primaryLight: "#FFB547",
    primaryDark: "#E85D00",
    
    accent: "#10B981", // Calm Green (Success)
    accentLight: "#34D399",
    
    // Neutrals (Dark Premium Navy Base)
    background: "#020617", // Deep Midnight
    surface: "#0F172A",    // Normal cards
    surfaceElevated: "#1E293B", // Hero/Focused cards
    surfaceGlass: "rgba(15, 23, 42, 0.8)", // Frosted overlays
    
    // Text Hierarchy
    textPrimary: "#F8FAFC",   // Maximum contrast
    textSecondary: "#94A3B8", // Slate 400
    textMuted: "#64748B",     // Slate 500
    textDisabled: "#334155",  // Slate 700
    
    // Status
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    
    // Borders & Dividers
    border: "rgba(248, 250, 252, 0.08)",
    divider: "rgba(248, 250, 252, 0.04)",

    // Lighting (Phase 8)
    glowPrimary: "rgba(255, 122, 24, 0.22)",
    glowSuccess: "rgba(16, 185, 129, 0.15)",
    shadowSoft: "rgba(0, 0, 0, 0.4)",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    giant: 32,
    huge: 40,
    massive: 56,
  },

  radius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    giant: 40,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.12,
      shadowRadius: 32,
      elevation: 8,
    },
    // Phase 8: Atmospheric Glow
    glow: {
      shadowColor: "#FF7A18",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 10,
    },
  },

  typography: {
    fontFamily: {
      hero: "Plus-ExtraBold",
      section: "Plus-Bold",
      card: "Plus-SemiBold",
      metadata: "Plus-Medium",
      caption: "Plus-Regular",
    },
    size: {
      hero: 52,
      section: 34,
      card: 18,
      body: 15,
      metadata: 15, // Mapping metadata to body size for consistency
      caption: 12,
      tiny: 10,
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.4,
      relaxed: 1.6,
    },
  },

  animation: {
    // Phase 8: Premium Transitions (Clean & Subdued)
    duration: {
      fast: 200,
      normal: 350,
      slow: 500,
    },
    easing: {
      out: [0.22, 1, 0.36, 1], // Deceleration
      inOut: [0.65, 0, 0.35, 1], // Smooth sine-like
    },
    // Reanimated Presets
    spring: {
      damping: 20, // Increased for less bounce
      stiffness: 120,
      mass: 1,
    },
    layout: {
      subtle: { damping: 25, stiffness: 100 },
    }
  },

  haptics: {
    selection: "selection",
    success: "success",
    warning: "warning",
    error: "error",
    impact: {
      light: "light",
      medium: "medium",
      heavy: "heavy",
    }
  },

  glass: {
    light: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.15)",
      borderWidth: 1,
    },
    dark: {
      backgroundColor: "rgba(15, 23, 42, 0.6)",
      borderColor: "rgba(248, 250, 252, 0.08)",
      borderWidth: 1,
    },
  },

  gradients: {
    primary: ["#FF8C38", "#FF6A00"],
    surface: ["#1E293B", "#0F172A"],
    glass: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.02)"],
    midnight: ["#0F172A", "#020617"],
    success: ["#10B981", "#059669"],
  },
};
