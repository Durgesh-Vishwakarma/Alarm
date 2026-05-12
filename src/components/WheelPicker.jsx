import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "../theme";

const ITEM_HEIGHT = 52;
const VISIBLE_COUNT = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const PADDING = ITEM_HEIGHT * Math.floor(VISIBLE_COUNT / 2);

/**
 * Wheel Column Component
 * Optimized for performance by removing high-frequency haptics and using internal scroll guards.
 */
const WheelColumn = ({ data, selectedValue, onValueChange, width = 76 }) => {
  const scrollRef = useRef(null);
  const isInternalScroll = useRef(false);

  // Sync scroll position when selectedValue changes from external source
  useEffect(() => {
    if (isInternalScroll.current) {
      isInternalScroll.current = false;
      return;
    }

    const idx = Math.max(0, data.indexOf(selectedValue));
    // Small delay to ensure layout stability
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: idx * ITEM_HEIGHT,
        animated: false,
      });
    }, 10);
    return () => clearTimeout(timer);
  }, [data, selectedValue]);

  const handleScrollEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, data.length - 1));

    const newValue = data[clamped];
    if (newValue !== selectedValue) {
      isInternalScroll.current = true;
      onValueChange(newValue);
    }
  };

  return (
    <View style={[styles.col, { width, height: PICKER_HEIGHT }]}>
      {/* Background Glow for centered selection */}
      <View style={styles.glow} pointerEvents="none" />
      <View style={styles.band} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={32} // Reduced frequency for performance
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{ paddingVertical: PADDING }}
        nestedScrollEnabled={true}
        removeClippedSubviews={false}
      >
        {data.map((item, i) => (
          <View key={`${item}-${i}`} style={styles.item}>
            <Text
              style={[styles.txt, item === selectedValue && styles.txtActive]}
            >
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Premium Overlay Gradients */}
      <LinearGradient
        colors={[
          "rgba(28, 28, 28, 1)",
          "rgba(28, 28, 28, 0.4)",
          "rgba(28, 28, 28, 0)",
        ]}
        style={[styles.gradient, { top: 0 }]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[
          "rgba(28, 28, 28, 0)",
          "rgba(28, 28, 28, 0.4)",
          "rgba(28, 28, 28, 1)",
        ]}
        style={[styles.gradient, { bottom: 0 }]}
        pointerEvents="none"
      />
    </View>
  );
};

const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const PERIODS = ["AM", "PM"];

const WheelTimePicker = ({
  hour,
  minute,
  period,
  onChangeHour,
  onChangeMinute,
  onChangePeriod,
}) => (
  <View style={styles.row}>
    <WheelColumn
      data={HOURS}
      selectedValue={hour}
      onValueChange={onChangeHour}
      width={76}
    />
    <Text style={styles.sep}>:</Text>
    <WheelColumn
      data={MINUTES}
      selectedValue={minute}
      onValueChange={onChangeMinute}
      width={76}
    />
    <View style={{ width: 12 }} />
    <WheelColumn
      data={PERIODS}
      selectedValue={period}
      onValueChange={onChangePeriod}
      width={66}
    />
  </View>
);

export default WheelTimePicker;

const styles = StyleSheet.create({
  col: {
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#1C1C1C",
    borderRadius: 18,
  },
  glow: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: "rgba(226, 55, 68, 0.05)",
    zIndex: 0,
  },
  band: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    backgroundColor: "rgba(226, 55, 68, 0.12)",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(226, 55, 68, 0.25)",
    zIndex: 10,
  },
  item: { height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" },
  txt: {
    fontFamily: typography.family.bold,
    fontSize: 20,
    color: "rgba(255,255,255,0.28)",
  },
  txtActive: {
    fontFamily: typography.family.extraBold,
    fontSize: 32,
    color: colors.primary,
    textShadowColor: "rgba(226, 55, 68, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  sep: {
    fontFamily: typography.family.extraBold,
    fontSize: 28,
    color: "#fff",
    marginHorizontal: 2,
    marginBottom: 4,
    opacity: 0.8,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 1.8,
    zIndex: 20,
  },
});
