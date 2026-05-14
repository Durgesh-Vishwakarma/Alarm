import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { typography, tokens } from "../theme";
import { useTheme } from "../theme/ThemeContext";

const ITEM_HEIGHT = 56;
const VISIBLE_COUNT = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const PADDING = ITEM_HEIGHT * Math.floor(VISIBLE_COUNT / 2);

/** 5 stacked copies; keep scroll position near middle blocks for smooth infinite scroll both directions */
const CYCLIC_COPIES = 5;
const MIDDLE_BLOCK_INDEX = 2;

const WheelColumn = ({ data, selectedValue, onValueChange, width = 80, isCyclic = true }) => {
  const { theme } = useTheme();
  const scrollRef = useRef(null);
  const isInternalScroll = useRef(false);
  const recenterLock = useRef(false);

  const n = data.length;
  const repeatedData = isCyclic ? Array.from({ length: CYCLIC_COPIES }, () => data).flat() : data;
  const middleOffset = isCyclic ? MIDDLE_BLOCK_INDEX * n : 0;

  useEffect(() => {
    if (isInternalScroll.current) {
      isInternalScroll.current = false;
      return;
    }
    const baseIdx = Math.max(0, data.indexOf(selectedValue));
    const targetIdx = baseIdx + middleOffset;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: targetIdx * ITEM_HEIGHT, animated: false });
    }, 10);
    return () => clearTimeout(timer);
  }, [selectedValue, data, middleOffset, n, isCyclic]);

  const recenterIfNeeded = (y) => {
    if (!isCyclic || recenterLock.current || n <= 0) return;
    const idx = Math.round(y / ITEM_HEIGHT);
    if (idx < n) {
      recenterLock.current = true;
      scrollRef.current?.scrollTo({ y: (idx + 2 * n) * ITEM_HEIGHT, animated: false });
      requestAnimationFrame(() => {
        recenterLock.current = false;
      });
    } else if (idx >= 4 * n) {
      recenterLock.current = true;
      scrollRef.current?.scrollTo({ y: (idx - 2 * n) * ITEM_HEIGHT, animated: false });
      requestAnimationFrame(() => {
        recenterLock.current = false;
      });
    }
  };

  const handleScrollEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, repeatedData.length - 1));
    const dataIdx = clamped % n;
    const newValue = data[dataIdx];

    if (isCyclic) {
      const resetIdx = middleOffset + dataIdx;
      scrollRef.current?.scrollTo({ y: resetIdx * ITEM_HEIGHT, animated: false });
    } else {
      scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    }

    if (newValue !== selectedValue) {
      isInternalScroll.current = true;
      onValueChange(newValue);
    }
  };

  return (
    <View style={[styles.col, { width, height: PICKER_HEIGHT }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="center"
        decelerationRate={0.985}
        scrollEventThrottle={16}
        onScroll={(e) => {
          if (isCyclic) recenterIfNeeded(e.nativeEvent.contentOffset.y);
        }}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{ paddingVertical: PADDING }}
        nestedScrollEnabled
      >
        {repeatedData.map((item, i) => {
          const isActive = (i % n) === data.indexOf(selectedValue);
          return (
            <View key={`${item}-${i}`} style={styles.item}>
              <Text
                style={[
                  styles.txtInactive,
                  { color: theme.textMuted },
                  isActive && styles.txtActive,
                  isActive && { color: tokens.colors.primary },
                ]}
              >
                {item}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

const WheelTimePicker = ({ hour, minute, period, onTimeChange }) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.glassHighlight}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={28} tint={isDark ? "dark" : "light"} style={styles.blur} />
        ) : (
          <LinearGradient
            colors={
              isDark
                ? ["rgba(255,255,255,0.08)", "rgba(15,23,42,0.28)"]
                : ["rgba(255,255,255,0.55)", "rgba(241,245,249,0.35)"]
            }
            style={StyleSheet.absoluteFillObject}
          />
        )}
      </View>

      <View style={styles.row}>
        <WheelColumn
          data={HOURS}
          selectedValue={hour}
          onValueChange={(v) => onTimeChange(v, minute, period)}
          width={88}
          isCyclic
        />
        <Text style={[styles.sep, { color: theme.textMuted }]}>:</Text>
        <WheelColumn
          data={MINUTES}
          selectedValue={minute}
          onValueChange={(v) => onTimeChange(hour, v, period)}
          width={88}
          isCyclic
        />
        <View style={{ width: 14 }} />
        <WheelColumn
          data={PERIODS}
          selectedValue={period}
          onValueChange={(v) => onTimeChange(hour, minute, v)}
          width={64}
          isCyclic
        />
      </View>

      <LinearGradient
        colors={[theme.bg, isDark ? "transparent" : "rgba(246,247,251,0)"]}
        style={[styles.mask, styles.maskTop]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[isDark ? "transparent" : "rgba(246,247,251,0)", theme.bg]}
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
  col: { overflow: "hidden" },
  item: { height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" },
  txtInactive: {
    fontFamily: typography.family.medium,
    fontSize: 22,
    opacity: 0.45,
    letterSpacing: -0.5,
  },
  txtActive: {
    fontFamily: typography.family.bold,
    fontSize: 36,
    letterSpacing: -0.6,
    opacity: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: PICKER_HEIGHT,
    zIndex: 2,
  },
  sep: {
    fontFamily: typography.family.bold,
    fontSize: 26,
    marginHorizontal: 4,
    marginBottom: 2,
    opacity: 0.35,
  },
  glassHighlight: {
    position: "absolute",
    height: ITEM_HEIGHT,
    left: "6%",
    right: "6%",
    top: ITEM_HEIGHT,
    borderRadius: tokens.radius.lg,
    overflow: "hidden",
    backgroundColor: Platform.OS === "android" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    zIndex: 1,
  },
  blur: {
    flex: 1,
  },
  mask: {
    position: "absolute",
    left: 0,
    right: 0,
    height: ITEM_HEIGHT + 8,
    zIndex: 3,
  },
  maskTop: { top: 0 },
  maskBottom: { bottom: 0 },
});
