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
  intensity = 20,
  onPress,
  onLongPress,
  containerStyle,
  pressScale = tokens.animation.pressScale,
  ...props
}) => {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress || onLongPress) {
      scale.value = withSpring(pressScale, tokens.animation.spring);
      haptics.impact("light");
    }
  };

  const handlePressOut = () => {
    if (onPress || onLongPress) {
      scale.value = withSpring(1, tokens.animation.spring);
    }
  };

  const glassStyle = {
    backgroundColor: Platform.OS === "ios"
      ? (isDark ? "rgba(15, 23, 42, 0.48)" : "rgba(255, 255, 255, 0.64)")
      : (isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.96)"),
    borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.05)",
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, { opacity: props.disabled ? 0.5 : 1 }]}
      {...props}
    >
      <Animated.View style={[styles.container, glassStyle, animatedStyle]}>
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={intensity}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <>
            <LinearGradient
              colors={isDark ? tokens.gradients.glassDark : tokens.gradients.glassLight}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <View style={[StyleSheet.absoluteFillObject, styles.androidEdge]} pointerEvents="none" />
          </>
        )}
        <View style={[styles.content, containerStyle]}>
          {children}
        </View>
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
  androidEdge: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.015)",
  },
  content: {
    zIndex: 1,
    width: "100%",
  },
});
