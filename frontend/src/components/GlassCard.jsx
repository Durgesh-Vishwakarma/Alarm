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
  pressScale = 0.97,
  ...props 
}) => {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress || onLongPress) {
      scale.value = withSpring(pressScale, { damping: 15, stiffness: 300 });
      haptics.impact("light");
    }
  };

  const handlePressOut = () => {
    if (onPress || onLongPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const glassStyle = {
    backgroundColor: Platform.OS === "ios"
      ? (isDark ? "rgba(15, 23, 42, 0.45)" : "rgba(255, 255, 255, 0.6)")
      : (isDark ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.95)"),
    borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [style, { opacity: props.disabled ? 0.5 : 1 }]}
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
          <LinearGradient
            colors={
              isDark
                ? ["rgba(30, 41, 59, 0.92)", "rgba(15, 23, 42, 0.88)"]
                : ["rgba(255, 255, 255, 0.97)", "rgba(248, 250, 252, 0.9)"]
            }
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
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
  },
  content: {
    zIndex: 1,
    width: "100%",
  }
});
