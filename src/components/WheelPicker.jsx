import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { typography } from '../theme';

const ITEM_HEIGHT = 52;
const VISIBLE_COUNT = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const PADDING = ITEM_HEIGHT * Math.floor(VISIBLE_COUNT / 2);

const WheelColumn = ({ data, selectedValue, onValueChange, width = 76 }) => {
  const scrollRef = useRef(null);
  const currentIdx = useRef(Math.max(0, data.indexOf(selectedValue)));

  const handleScrollEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, data.length - 1));
    
    if (clamped !== currentIdx.current) {
      currentIdx.current = clamped;
      Haptics.selectionAsync();
      onValueChange(data[clamped]);
    }
  };

  useEffect(() => {
    const idx = Math.max(0, data.indexOf(selectedValue));
    scrollRef.current?.scrollTo({
      y: idx * ITEM_HEIGHT,
      animated: false,
    });
  }, [data, selectedValue]);

  return (
    <View style={[styles.col, { width, height: PICKER_HEIGHT }]}>
      <View style={styles.band} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        bounces
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{ paddingVertical: PADDING }}
        nestedScrollEnabled
      >
        {data.map((item, i) => (
          <View key={`${item}-${i}`} style={styles.item}>
            <Text style={[styles.txt, item === selectedValue && styles.txtActive]}>
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

const WheelTimePicker = ({ hour, minute, period, onChangeHour, onChangeMinute, onChangePeriod }) => (
  <View style={styles.row}>
    <WheelColumn data={HOURS} selectedValue={hour} onValueChange={onChangeHour} width={76} />
    <Text style={styles.sep}>:</Text>
    <WheelColumn data={MINUTES} selectedValue={minute} onValueChange={onChangeMinute} width={76} />
    <View style={{ width: 12 }} />
    <WheelColumn data={PERIODS} selectedValue={period} onValueChange={onChangePeriod} width={66} />
  </View>
);

export default WheelTimePicker;

const styles = StyleSheet.create({
  col: { overflow: 'hidden', position: 'relative' },
  band: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 2, right: 2,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(226, 55, 68, 0.10)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 55, 68, 0.22)',
    zIndex: 10,
  },
  item: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  txt: { fontFamily: typography.family.bold, fontSize: 20, color: 'rgba(255,255,255,0.25)' },
  txtActive: { fontFamily: typography.family.extraBold, fontSize: 30, color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  sep: { fontFamily: typography.family.extraBold, fontSize: 30, color: '#fff', marginHorizontal: 2, marginBottom: 2 },
});
