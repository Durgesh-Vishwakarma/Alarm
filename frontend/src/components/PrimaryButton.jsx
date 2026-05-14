import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { tokens, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";
import { haptics } from "../services/hapticService";

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  icon,
  iconPosition = "right",
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  textStyle,
  hapticOnPress = "selection",
}) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const isInactive = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const runHaptic = () => {
    if (isInactive) return;
    if (hapticOnPress === "impact") haptics.impact("light");
    else if (hapticOnPress === "none") return;
    else haptics.selection();
  };

  const handlePress = () => {
    if (isInactive) return;
    runHaptic();
    onPress?.();
  };

  const handlePressIn = () => {
    if (isInactive) return;
    scale.value = withSpring(0.97, tokens.animation.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, tokens.animation.spring);
  };

  const gradientColors =
    variant === "success"
      ? tokens.gradients.success
      : variant === "danger"
      ? [theme.danger || "#EF4444", "#991B1B"]
      : variant === "primary"
      ? [theme.primary, tokens.colors.primaryDark]
      : null;

  const ghostBorder = isDark
    ? "rgba(255,255,255,0.12)"
    : "rgba(15,23,42,0.08)";

  const ghostBg = isDark
    ? "rgba(255,255,255,0.065)"
    : "rgba(15,23,42,0.045)";

  const mutedBg = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(15,23,42,0.06)";

  const isGhostLike = variant === "ghost" || variant === "muted";

  const iconColor = isGhostLike ? theme.textPrimary : "#FFF";
  const labelColor = isGhostLike ? theme.textPrimary : "#FFF";

  return (
    <Animated.View
      style={[
        fullWidth && s.fullWidth,
        animatedStyle,
        isInactive && s.disabledWrap,
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isInactive}
        hitSlop={4}
      >
        {isGhostLike ? (
          <View
            style={[
              s.base,
              s.ghost,
              {
                backgroundColor: variant === "muted" ? mutedBg : ghostBg,
                borderColor: ghostBorder,
              },
            ]}
          >
            <ButtonContent
              label={label}
              icon={icon}
              iconPosition={iconPosition}
              iconColor={iconColor}
              labelColor={labelColor}
              loading={loading}
              textStyle={textStyle}
            />
          </View>
        ) : (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.gradient}
          >
            <View style={s.highlight} pointerEvents="none" />
            <ButtonContent
              label={label}
              icon={icon}
              iconPosition={iconPosition}
              iconColor={iconColor}
              labelColor={labelColor}
              loading={loading}
              textStyle={textStyle}
            />
          </LinearGradient>
        )}
      </Pressable>
    </Animated.View>
  );
}

const ButtonContent = ({
  label,
  icon,
  iconPosition,
  iconColor,
  labelColor,
  loading,
  textStyle,
}) => {
  return (
    <View style={s.inner}>
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : icon && iconPosition === "left" ? (
        <Ionicons name={icon} size={18} color={iconColor} />
      ) : null}

      <Text style={[s.label, { color: labelColor }, textStyle]} numberOfLines={1}>
        {loading ? "Please wait..." : label}
      </Text>

      {!loading && icon && iconPosition === "right" ? (
        <Ionicons name={icon} size={18} color={iconColor} />
      ) : null}
    </View>
  );
};

const s = StyleSheet.create({
  fullWidth: {
    width: "100%",
  },

  disabledWrap: {
    opacity: 0.52,
  },

  base: {
    minHeight: 54,
    borderRadius: tokens.radius.xl,
    alignItems: "center",
    justifyContent: "center",
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
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  highlight: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  inner: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: tokens.spacing.md,
  },

  label: {
    fontFamily: typography.family.semiBold,
    fontSize: tokens.typography.size.body,
    letterSpacing: 0,
  },
});