import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolateColor,
  useSharedValue
} from "react-native-reanimated";
import { tokens } from "../theme/tokens";
import { haptics } from "../services/hapticService";

export const CustomSwitch = ({ value, onValueChange, activeColor }) => {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 250 });
  }, [value]);

  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 20 }],
  }));

  const animatedBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["rgba(255,255,255,0.1)", activeColor || tokens.colors.primary]
    ),
  }));

  const handlePress = () => {
    haptics.selection();
    onValueChange(!value);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.track, animatedBgStyle]}>
        <Animated.View style={[styles.dot, animatedDotStyle]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFF",
  },
});
