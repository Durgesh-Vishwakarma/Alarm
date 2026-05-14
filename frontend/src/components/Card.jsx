import { StyleSheet, TouchableOpacity, View } from "react-native";
import { spacing } from "../theme";
import { useTheme } from "../theme/ThemeContext";

export const Card = ({
  children,
  style,
  contentStyle,
  variant = "default",
  padding = "lg",
  onPress,
  disabled = false,
  ...touchableProps
}) => {
  const { theme } = useTheme();
  const Component = onPress ? TouchableOpacity : View;

  const variantStyle =
    variant === "active"
      ? {
          backgroundColor: theme.card,
          borderColor: theme.primary,
          borderWidth: 1.5,
        }
      : variant === "danger"
      ? {
          backgroundColor: theme.card,
          borderColor: theme.danger,
          borderWidth: 1.5,
        }
      : variant === "muted"
      ? {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
          opacity: 0.86,
        }
      : {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
        };

  return (
    <Component
      style={[styles.container, variantStyle, disabled && styles.disabled, style]}
      {...(onPress
        ? {
            onPress,
            activeOpacity: 0.9,
            disabled,
            ...touchableProps,
          }
        : {})}
    >
      <View
        style={[
          styles.content,
          padding !== "none" && { padding: spacing[padding] || spacing.lg },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },

  content: {
    flex: 1,
  },

  disabled: {
    opacity: 0.6,
  },
});