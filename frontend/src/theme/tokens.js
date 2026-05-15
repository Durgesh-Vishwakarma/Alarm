export const colors = {
  background: "#F8FAFE",

  surface: "#FFFFFF",
  surfaceMuted: "#FFF4EC",

  text: "#0F172A",
  textMuted: "#7C889B",
  textLight: "#A0AEC0",

  border: "#E5EAF2",
  borderSoft: "#EEF2F7",

  primary: "#FF6A00",
  primaryDark: "#E55F00",
  primaryLight: "#FF8A33",
  primarySoft: "#FFF1E7",

  accent: "#FF9A3D",
  accentSoft: "#FFE4C7",

  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",

  white: "#FFFFFF",
  black: "#000000",

  shadow: "rgba(15, 23, 42, 0.08)",
};

export const fonts = {
  heading: "PlusJakartaSans_700Bold",
  headingSemiBold: "PlusJakartaSans_600SemiBold",

  body: "Outfit_400Regular",
  bodyMedium: "Outfit_500Medium",
  bodySemiBold: "Outfit_600SemiBold",
  bodyBold: "Outfit_700Bold",

  fallback: "System",
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  display: 48,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const shadows = {
  soft: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  medium: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },

  glow: {
    shadowColor: "#FF6A00",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
};

export const theme = {
  colors,
  fonts,
  fontSizes,
  space,
  radii,
  shadows,
};