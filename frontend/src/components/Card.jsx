import { StyleSheet, TouchableOpacity, View } from "react-native";
import { spacing } from "../theme";
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

  const variantStyle = variant === "active"
    ? { backgroundColor: theme.card, borderColor: theme.primary, borderWidth: 1.5 }
    : variant === "danger"
    ? { backgroundColor: theme.card, borderColor: theme.danger, borderWidth: 1.5 }
    : { backgroundColor: theme.card, borderColor: theme.cardBorder };

  return (
    <Component
      style={[
        styles.container,
        padding !== "none" && { padding: spacing[padding] || spacing.lg },
        variantStyle,
        style,
      ]}
      {...(onPress ? { onPress, activeOpacity: 0.92, ...touchableProps } : {})}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24, // Premium rounded-xl style
    borderWidth: 1,
    overflow: "hidden",
  },
});
