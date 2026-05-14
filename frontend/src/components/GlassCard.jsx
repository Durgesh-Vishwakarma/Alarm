import { StyleSheet, View, Platform, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { tokens } from "../theme";
import { useTheme } from "../theme/ThemeContext";
import { haptics } from "../services/hapticService";

export const GlassCard = ({
  children,
  style,
  intensity = 24,
  onPress,
  onLongPress,
  containerStyle,
  pressScale = tokens.animation.pressScale,
  disabled = false,
  borderColor,
  backgroundColor,
  ...props
}) => {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);

  const canPress = !!onPress || !!onLongPress;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && canPress) {
      scale.value = withSpring(pressScale, tokens.animation.spring);
      haptics.impact("light");
    }
  };

  const handlePressOut = () => {
    if (!disabled && canPress) {
      scale.value = withSpring(1, tokens.animation.spring);
    }
  };

  const glassStyle = {
    backgroundColor:
      backgroundColor ||
      (Platform.OS === "ios"
        ? isDark
          ? "rgba(15, 23, 42, 0.56)"
          : "rgba(255, 255, 255, 0.68)"
        : isDark
        ? "rgba(15, 23, 42, 0.92)"
        : "rgba(255, 255, 255, 0.96)"),

    borderColor:
      borderColor ||
      (isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.06)"),
  };

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onLongPress={disabled ? undefined : onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={style}
      {...props}
    >
      <Animated.View
        style={[
          styles.container,
          glassStyle,
          animatedStyle,
          disabled && styles.disabled,
        ]}
      >
        {Platform.OS === "ios" ? (
          <>
            <BlurView
              intensity={intensity}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFillObject}
            />
            <LinearGradient
              colors={
                isDark
                  ? ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.025)"]
                  : ["rgba(255,255,255,0.55)", "rgba(255,255,255,0.18)"]
              }
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
          </>
        ) : (
          <>
            <LinearGradient
              colors={
                isDark
                  ? tokens.gradients.glassDark
                  : tokens.gradients.glassLight
              }
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <View
              style={[StyleSheet.absoluteFillObject, styles.androidEdge]}
              pointerEvents="none"
            />
          </>
        )}

        <View style={[styles.innerBorder]} pointerEvents="none" />

        <View style={[styles.content, containerStyle]}>{children}</View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    ...tokens.shadows.sm,
  },

  disabled: {
    opacity: 0.92,
  },

  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.035)",
  },

  androidEdge: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.018)",
  },

  content: {
    zIndex: 1,
    width: "100%",
  },
});