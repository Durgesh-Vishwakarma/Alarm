import { StyleSheet, Text, View, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import WheelPicker from "@quidone/react-native-wheel-picker";

import { typography, tokens } from "../theme";
import { useTheme } from "../theme/ThemeContext";
import { haptics } from "../services/hapticService";

const ITEM_HEIGHT = 64;
const VISIBLE_COUNT = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;

const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);

const PERIODS = ["AM", "PM"];

const toItems = (data) =>
  data.map((value) => ({
    value,
    label: value,
  }));

const WheelColumn = ({
  data,
  selectedValue,
  onValueChange,
  width = 92,
}) => {
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
      overlayItemStyle={styles.overlayItem}
      style={styles.picker}
      renderOverlay={() => null}
      onValueChanged={({ item }) => {
        if (item.value !== selectedValue) {
          haptics.selection();
          onValueChange(item.value);
        }
      }}
      renderItem={({ item }) => {
        const active = item.value === selectedValue;

        return (
          <View style={styles.item}>
            <Text
              style={[
                styles.itemText,
                { color: theme.textMuted },

                active && [
                  styles.activeText,
                  {
                    color: "#FFF",
                  },
                ],
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

const WheelTimePicker = ({
  hour,
  minute,
  period,
  onTimeChange,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.08)",
          "rgba(255,255,255,0.02)",
        ]}
        style={styles.outerGlow}
      />

      <View style={styles.centerHighlight}>
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={34}
            tint={isDark ? "dark" : "light"}
            style={styles.blur}
          />
        ) : (
          <LinearGradient
            colors={
              isDark
                ? [
                    "rgba(255,255,255,0.10)",
                    "rgba(255,255,255,0.03)",
                  ]
                : [
                    "rgba(255,255,255,0.16)",
                    "rgba(255,255,255,0.05)",
                  ]
            }
            style={StyleSheet.absoluteFillObject}
          />
        )}

        <View style={styles.centerStroke} />
      </View>

      <View style={styles.row}>
        <WheelColumn
          data={HOURS}
          selectedValue={hour}
          onValueChange={(v) =>
            onTimeChange(v, minute, period)
          }
          width={94}
        />

        <Text style={styles.sep}>:</Text>

        <WheelColumn
          data={MINUTES}
          selectedValue={minute}
          onValueChange={(v) =>
            onTimeChange(hour, v, period)
          }
          width={94}
        />

        <View style={styles.periodGap} />

        <WheelColumn
          data={PERIODS}
          selectedValue={period}
          onValueChange={(v) =>
            onTimeChange(hour, minute, v)
          }
          width={76}
        />
      </View>

      <LinearGradient
        colors={
          isDark
            ? [theme.bg, "rgba(2,6,23,0)"]
            : [theme.bg, "rgba(246,247,251,0)"]
        }
        style={[styles.mask, styles.maskTop]}
        pointerEvents="none"
      />

      <LinearGradient
        colors={
          isDark
            ? ["rgba(2,6,23,0)", theme.bg]
            : ["rgba(246,247,251,0)", theme.bg]
        }
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

  outerGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * 1.7,
    height: ITEM_HEIGHT * 1.6,
    borderRadius: 32,
    opacity: 0.8,
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
    zIndex: 3,
  },

  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },

  itemText: {
    fontFamily: typography.family.medium,
    fontSize: 24,
    opacity: 0.24,
    letterSpacing: -0.3,
  },

  activeText: {
    fontFamily: typography.family.extraBold,
    fontSize: 44,
    opacity: 1,
    letterSpacing: -2.2,

    textShadowColor: "rgba(255,255,255,0.16)",
    textShadowRadius: 12,
  },

  sep: {
    fontFamily: typography.family.extraBold,
    fontSize: 32,
    color: "rgba(255,255,255,0.35)",
    marginHorizontal: 4,
    marginTop: -2,
  },

  periodGap: {
    width: 14,
  },

  centerHighlight: {
    position: "absolute",
    height: ITEM_HEIGHT + 2,
    left: "4%",
    right: "4%",
    top: ITEM_HEIGHT * 2,
    borderRadius: 26,
    overflow: "hidden",
    zIndex: 2,
  },

  centerStroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
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
    height: ITEM_HEIGHT + 20,
    zIndex: 5,
  },

  maskTop: {
    top: 0,
  },

  maskBottom: {
    bottom: 0,
  },
});