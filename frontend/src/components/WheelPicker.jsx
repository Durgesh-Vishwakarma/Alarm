import { StyleSheet, Text, View, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import WheelPicker from "@quidone/react-native-wheel-picker";
import { typography, tokens } from "../theme";
import { useTheme } from "../theme/ThemeContext";
import { haptics } from "../services/hapticService";

const ITEM_HEIGHT = 56;
const VISIBLE_COUNT = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;

const toItems = (data) => data.map((value) => ({ value, label: value }));

const WheelColumn = ({ data, selectedValue, onValueChange, width = 80 }) => {
  const { theme } = useTheme();

  return (
    <WheelPicker
      data={toItems(data)}
      value={selectedValue}
      width={width}
      itemHeight={ITEM_HEIGHT}
      visibleItemCount={VISIBLE_COUNT}
      enableScrollByTapOnItem
      disableIntervalMomentum
      onValueChanged={({ item }) => {
        if (item.value !== selectedValue) {
          haptics.selection();
          onValueChange(item.value);
        }
      }}
      overlayItemStyle={styles.overlayItem}
      style={styles.picker}
      itemTextStyle={[styles.itemText, { color: theme.textMuted }]}
      renderOverlay={() => null}
      renderItem={({ item }) => {
        const isActive = item.value === selectedValue;
        return (
          <View style={styles.item}>
            <Text
              style={[
                styles.itemText,
                { color: theme.textMuted },
                isActive && styles.activeText,
                isActive && { color: tokens.colors.primary },
              ]}
            >
              {item.label}
            </Text>
          </View>
        );
      }}
    />
  );
};

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

const WheelTimePicker = ({ hour, minute, period, onTimeChange }) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.centerHighlight}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={28} tint={isDark ? "dark" : "light"} style={styles.blur} />
        ) : (
          <LinearGradient
            colors={isDark ? tokens.gradients.glassDark : tokens.gradients.glassLight}
            style={StyleSheet.absoluteFillObject}
          />
        )}
      </View>

      <View style={styles.row}>
        <WheelColumn data={HOURS} selectedValue={hour} onValueChange={(v) => onTimeChange(v, minute, period)} width={86} />
        <Text style={[styles.sep, { color: theme.textMuted }]}>:</Text>
        <WheelColumn data={MINUTES} selectedValue={minute} onValueChange={(v) => onTimeChange(hour, v, period)} width={86} />
        <View style={styles.periodGap} />
        <WheelColumn data={PERIODS} selectedValue={period} onValueChange={(v) => onTimeChange(hour, minute, v)} width={66} />
      </View>

      <LinearGradient
        colors={isDark ? [theme.bg, "rgba(2,6,23,0)"] : [theme.bg, "rgba(246,247,251,0)"]}
        style={[styles.mask, styles.maskTop]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={isDark ? ["rgba(2,6,23,0)", theme.bg] : ["rgba(246,247,251,0)", theme.bg]}
        style={[styles.mask, styles.maskBottom]}
        pointerEvents="none"
      />
    </View>
  );
};

export default WheelTimePicker;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    height: PICKER_HEIGHT,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    height: PICKER_HEIGHT,
    backgroundColor: "transparent",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: PICKER_HEIGHT,
    zIndex: 2,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontFamily: typography.family.regular,
    fontSize: 22,
    opacity: 0.48,
    letterSpacing: 0,
  },
  activeText: {
    fontFamily: typography.family.bold,
    fontSize: 34,
    opacity: 1,
  },
  sep: {
    fontFamily: typography.family.bold,
    fontSize: 26,
    marginHorizontal: tokens.spacing.xs,
    opacity: 0.35,
  },
  periodGap: {
    width: tokens.spacing.md,
  },
  centerHighlight: {
    position: "absolute",
    height: ITEM_HEIGHT,
    left: "6%",
    right: "6%",
    top: ITEM_HEIGHT * 2,
    borderRadius: tokens.radius.lg,
    overflow: "hidden",
    backgroundColor: Platform.OS === "android" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    zIndex: 1,
  },
  overlayItem: {
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  blur: {
    flex: 1,
  },
  mask: {
    position: "absolute",
    left: 0,
    right: 0,
    height: ITEM_HEIGHT + tokens.spacing.md,
    zIndex: 3,
  },
  maskTop: { top: 0 },
  maskBottom: { bottom: 0 },
});
