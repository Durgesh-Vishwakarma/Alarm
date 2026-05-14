import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";
import { haptics } from "../services/hapticService";

/**
 * Theme-aware CTA: primary (purple), success (green), ghost, muted.
 */
export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  icon,
  iconPosition = "right",
  disabled = false,
  style,
  textStyle,
  hapticOnPress = "selection",
}) {
  const { theme, isDark } = useTheme();

  const runHaptic = () => {
    if (disabled) return;
    if (hapticOnPress === "impact") haptics.impact("light");
    else if (hapticOnPress === "none") return;
    else haptics.selection();
  };

  const gradientColors =
    variant === "success"
      ? tokens.gradients.success
      : variant === "primary"
        ? [theme.primary, tokens.colors.primaryDark]
        : null;

  const ghostBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.08)";
  const ghostBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.04)";

  if (variant === "ghost" || variant === "muted") {
    return (
      <Pressable
        onPress={() => {
          runHaptic();
          onPress?.();
        }}
        disabled={disabled}
        style={({ pressed }) => [
          s.base,
          s.ghost,
          {
            backgroundColor: variant === "muted" ? theme.surface : ghostBg,
            borderColor: ghostBorder,
            opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
          },
          style,
        ]}
      >
        {icon && iconPosition === "left" ? (
          <Ionicons name={icon} size={18} color={theme.textPrimary} style={s.iconLeft} />
        ) : null}
        <Text style={[s.labelGhost, { color: theme.textPrimary }, textStyle]}>{label}</Text>
        {icon && iconPosition === "right" ? (
          <Ionicons name={icon} size={18} color={theme.textPrimary} style={s.iconRight} />
        ) : null}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => {
        runHaptic();
        onPress?.();
      }}
      disabled={disabled}
      style={({ pressed }) => [s.touch, { opacity: disabled ? 0.45 : pressed ? 0.92 : 1 }, style]}
    >
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.gradient}>
        <View style={s.inner}>
          {icon && iconPosition === "left" ? <Ionicons name={icon} size={18} color="#FFF" style={s.iconLeft} /> : null}
          <Text style={[s.label, textStyle]}>{label}</Text>
          {icon && iconPosition === "right" ? <Ionicons name={icon} size={18} color="#FFF" style={s.iconRight} /> : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const s = StyleSheet.create({
  touch: { width: "100%" },
  base: {
    minHeight: 52,
    borderRadius: tokens.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: tokens.spacing.lg,
  },
  ghost: {
    borderWidth: 1,
  },
  gradient: {
    minHeight: 56,
    borderRadius: tokens.radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: tokens.spacing.md,
  },
  label: {
    color: "#FFF",
    fontFamily: typography.family.card,
    fontSize: tokens.typography.size.card,
    letterSpacing: 0.3,
  },
  labelGhost: {
    fontFamily: typography.family.card,
    fontSize: tokens.typography.size.body,
    letterSpacing: 0.2,
  },
  iconLeft: { marginRight: 4 },
  iconRight: { marginLeft: 4 },
});
