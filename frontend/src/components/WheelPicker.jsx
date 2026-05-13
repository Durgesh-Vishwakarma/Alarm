import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";

const ITEM_HEIGHT = 52;
const VISIBLE_COUNT = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const PADDING = ITEM_HEIGHT * Math.floor(VISIBLE_COUNT / 2);

const WheelColumn = ({ data, selectedValue, onValueChange, width = 76 }) => {
  const { theme } = useTheme();
  const scrollRef = useRef(null);
  const isInternalScroll = useRef(false);

  useEffect(() => {
    if (isInternalScroll.current) {
      isInternalScroll.current = false;
      return;
    }
    const idx = Math.max(0, data.indexOf(selectedValue));
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
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
    <View style={[styles.col, { width, height: PICKER_HEIGHT, backgroundColor: theme.heroCard }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={32}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{ paddingVertical: PADDING }}
        nestedScrollEnabled={true}
      >
        {data.map((item, i) => (
          <View key={`${item}-${i}`} style={styles.item}>
            <Text style={[styles.txt, item === selectedValue && [styles.txtActive, { color: theme.heroNeon }]]}>
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={[styles.selectionLine, { borderColor: theme.heroNeon + "33" }]} pointerEvents="none" />
    </View>
  );
};

const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

const WheelTimePicker = ({ hour, minute, period, onChangeHour, onChangeMinute, onChangePeriod }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <WheelColumn data={HOURS}    selectedValue={hour}   onValueChange={onChangeHour}   width={76} />
      <Text style={[styles.sep, { color: theme.heroNeon }]}>:</Text>
      <WheelColumn data={MINUTES}  selectedValue={minute} onValueChange={onChangeMinute} width={76} />
      <View style={{ width: 12 }} />
      <WheelColumn data={PERIODS}  selectedValue={period} onValueChange={onChangePeriod} width={66} />
    </View>
  );
};

export default WheelTimePicker;

const styles = StyleSheet.create({
  col: { overflow: "hidden", position: "relative", borderRadius: 18 },
  item: { height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" },
  txt: {
    fontFamily: typography.family.bold,
    fontSize: 20,
    color: "rgba(255,255,255,0.28)",
  },
  txtActive: {
    fontFamily: typography.family.extraBold,
    fontSize: 32,
  },
  selectionLine: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: 10,
    right: 10,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  sep: {
    fontFamily: typography.family.extraBold,
    fontSize: 28,
    marginHorizontal: 2,
    marginBottom: 4,
    opacity: 0.8,
  },
});
