import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  useSharedValue,
} from "react-native-reanimated";
import { tokens } from "../theme/tokens";
import { haptics } from "../services/hapticService";

export const CustomSwitch = ({
  value,
  onValueChange,
  activeColor = tokens.colors.primary,
  inactiveColor = "rgba(148,163,184,0.28)",
  thumbOnColor = "#FFFFFF",
  thumbOffColor = "#FFFFFF",
  disabled = false,
}) => {
  const progress = useSharedValue(value ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 220 });
  }, [value]);

  const animatedTrackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [inactiveColor, activeColor]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      ["rgba(148,163,184,0.24)", activeColor]
    ),
  }));

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 20 }, { scale: scale.value }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [thumbOffColor, thumbOnColor]
    ),
  }));

  const handlePress = () => {
    if (disabled) return;

    haptics.selection();

    scale.value = withSpring(0.86, tokens.animation.spring, () => {
      scale.value = withSpring(1, tokens.animation.spring);
    });

    onValueChange?.(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      hitSlop={12}
      style={disabled && styles.disabled}
    >
      <Animated.View style={[styles.track, animatedTrackStyle]}>
        <Animated.View style={[styles.thumb, animatedThumbStyle]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1,
  },

  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  disabled: {
    opacity: 0.45,
  },
});