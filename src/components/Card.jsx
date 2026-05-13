import { StyleSheet, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../theme";
import { useTheme } from "../theme/ThemeContext";

export const Card = ({
  children,
  style,
  variant = "default",
  padding = "lg",
  onPress,
  ...touchableProps
}) => {
  const { theme } = useTheme();
  const Component = onPress ? TouchableOpacity : View;

  // Base card uses theme tokens; variant overrides for special states
  const variantStyle = variant === "hud"
    ? { backgroundColor: theme.heroCard, borderColor: theme.heroBorder }
    : variant === "active"
    ? { backgroundColor: theme.card, borderColor: theme.primary }
    : variant === "ringing"
    ? { backgroundColor: theme.card, borderColor: colors.ringing, borderWidth: 1.5 }
    : variant === "success"
    ? { backgroundColor: theme.card, borderColor: colors.success, borderWidth: 1.5 }
    : variant === "danger"
    ? { backgroundColor: theme.card, borderColor: theme.danger, borderWidth: 1.5 }
    : variant === "failed"
    ? { backgroundColor: theme.surface, borderColor: theme.cardBorder, opacity: 0.7 }
    : { backgroundColor: theme.card, borderColor: theme.cardBorder };

  return (
    <Component
      style={[
        styles.container,
        padding !== "none" && { padding: spacing[padding] || spacing.lg },
        variantStyle,
        style,
      ]}
      {...(onPress ? { onPress, activeOpacity: 0.88, ...touchableProps } : {})}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
  },
});
