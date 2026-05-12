import { StyleSheet, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../theme";

/**
 * SnapWake Premium Card
 * A robust surface component designed for the SnapWake futuristic HUD identity.
 * Replaces legacy glassmorphism with crisp, state-driven surfaces that align
 * perfectly with the app's typography and color system.
 *
 * @param {('default'|'active'|'ringing'|'success'|'danger'|'failed'|'hud')} variant - Visual style variant
 * @param {('none'|'sm'|'md'|'lg'|'xl')} padding - Inner spacing level from theme
 */
export const Card = ({
  children,
  style,
  variant = "default",
  padding = "lg",
  onPress,
  ...touchableProps
}) => {
  const Component = onPress ? TouchableOpacity : View;

  const variantStyles = [
    styles.container,
    padding !== "none" && { padding: spacing[padding] || spacing.lg },
    styles[variant],
    style,
  ];

  return (
    <Component
      style={variantStyles}
      {...(onPress ? { onPress, activeOpacity: 0.88, ...touchableProps } : {})}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    // Primary surface identity
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  // --- SEMANTIC VARIANTS ---

  default: {},

  active: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
    borderWidth: 1,
  },

  ringing: {
    backgroundColor: colors.card,
    borderColor: colors.ringing,
    borderWidth: 1.5,
  },

  success: {
    borderColor: colors.success,
    backgroundColor: colors.card,
    borderWidth: 1.5,
  },

  danger: {
    borderColor: colors.danger,
    backgroundColor: colors.card,
    borderWidth: 1.5,
  },

  failed: {
    borderColor: colors.dot,
    backgroundColor: colors.surface,
    opacity: 0.7,
  },

  /**
   * HUD VARIANT
   * Optimized for dark-mode immersive screens (WakeUp, Camera HUD).
   * Uses the deep obsidian surface tokens.
   */
  hud: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.border,
    borderWidth: 1,
  },
});
