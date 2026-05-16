import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';

const WHEEL_ITEM_HEIGHT = 50;
const WHEEL_VISIBLE_ITEMS = 5;
const WHEEL_REPEAT_COUNT = 9;
const WHEEL_CENTER_BLOCK = Math.floor(WHEEL_REPEAT_COUNT / 2);
const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);

function numberLabel(value) {
  return String(value).padStart(2, '0');
}

const WheelItem = memo(function WheelItem({ formatter, isSelected, item, onPress }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.wheelItem}>
      <Text style={[styles.wheelText, isSelected && styles.wheelTextActive]}>
        {formatter(item)}
      </Text>
    </Pressable>
  );
});

function WheelColumn({
  accessibilityLabel,
  formatter = numberLabel,
  onChange,
  onInteractionEnd,
  onInteractionStart,
  value,
  values,
  width,
}) {
  const scrollRef = useRef(null);
  const didPositionInitially = useRef(false);
  const releaseTimer = useRef(null);
  const settleTimer = useRef(null);
  const visualValueRef = useRef(value);
  const [visualRawIndex, setVisualRawIndex] = useState(
    WHEEL_CENTER_BLOCK * values.length + Math.max(values.indexOf(value), 0),
  );
  const selectedIndex = Math.max(values.indexOf(value), 0);
  const wheelValues = useMemo(
    () => Array.from({ length: WHEEL_REPEAT_COUNT }, () => values).flat(),
    [values],
  );

  const scrollToIndex = (index, animated = false) => {
    scrollRef.current?.scrollTo({
      animated,
      y: index * WHEEL_ITEM_HEIGHT,
    });
  };

  useEffect(() => {
    if (!didPositionInitially.current) {
      didPositionInitially.current = true;
      const initialIndex = WHEEL_CENTER_BLOCK * values.length + selectedIndex;
      setVisualRawIndex(initialIndex);
      scrollToIndex(initialIndex);
    }
  }, [selectedIndex, values.length]);

  useEffect(() => {
    const nextIndex = WHEEL_CENTER_BLOCK * values.length + selectedIndex;
    visualValueRef.current = value;
    setVisualRawIndex(nextIndex);
    scrollToIndex(nextIndex);
  }, [selectedIndex, value, values.length]);

  const updateVisualFromOffset = (offsetY) => {
    const rawIndex = Math.round(offsetY / WHEEL_ITEM_HEIGHT);
    const normalizedIndex = ((rawIndex % values.length) + values.length) % values.length;
    const nextValue = values[normalizedIndex];

    if (nextValue !== visualValueRef.current) {
      visualValueRef.current = nextValue;
    }

    setVisualRawIndex(rawIndex);

    return { nextValue, normalizedIndex, rawIndex };
  };

  const handleScrollEnd = (event) => {
    const { nextValue, normalizedIndex, rawIndex } = updateVisualFromOffset(
      event.nativeEvent.contentOffset.y,
    );
    const shouldRecenter =
      rawIndex < values.length || rawIndex > values.length * (WHEEL_REPEAT_COUNT - 2);

    if (nextValue !== value) {
      onChange(nextValue);
    }

    if (shouldRecenter) {
      const centeredIndex = WHEEL_CENTER_BLOCK * values.length + normalizedIndex;
      setVisualRawIndex(centeredIndex);
      scrollToIndex(centeredIndex);
    }

    onInteractionEnd?.();
  };

  const handleScroll = (event) => {
    updateVisualFromOffset(event.nativeEvent.contentOffset.y);
  };

  const holdInteraction = () => {
    if (releaseTimer.current) {
      clearTimeout(releaseTimer.current);
      releaseTimer.current = null;
    }
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    onInteractionStart?.();
  };

  const settleWithoutMomentum = (event) => {
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
    }
    settleTimer.current = setTimeout(() => {
      handleScrollEnd(event);
      settleTimer.current = null;
    }, 60);
  };

  const releaseInteractionSoon = () => {
    if (releaseTimer.current) {
      clearTimeout(releaseTimer.current);
    }
    releaseTimer.current = setTimeout(() => {
      onInteractionEnd?.();
      releaseTimer.current = null;
    }, 140);
  };

  return (
    <View style={[styles.wheelColumn, { width }]}>
      <ScrollView
        accessibilityLabel={accessibilityLabel}
        bounces={false}
        decelerationRate="fast"
        disableIntervalMomentum={false}
        onMomentumScrollEnd={handleScrollEnd}
        onMomentumScrollBegin={holdInteraction}
        onScroll={handleScroll}
        onScrollBeginDrag={holdInteraction}
        onScrollEndDrag={settleWithoutMomentum}
        onTouchCancel={releaseInteractionSoon}
        onTouchStart={holdInteraction}
        overScrollMode="never"
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_HEIGHT}
      >
        <View style={styles.wheelSpacer} />
        {wheelValues.map((item, index) => {
          return (
            <WheelItem
              formatter={formatter}
              isSelected={index === visualRawIndex}
              item={item}
              key={`${accessibilityLabel}-${index}-${item}`}
              onPress={() => {
                visualValueRef.current = item;
                setVisualRawIndex(index);
                onChange(item);
                scrollToIndex(index, true);
              }}
            />
          );
        })}
        <View style={styles.wheelSpacer} />
      </ScrollView>
    </View>
  );
}

function PeriodWheel({ onInteractionEnd, onInteractionStart, period, updateDraft }) {
  const scrollRef = useRef(null);
  const didPositionInitially = useRef(false);
  const releaseTimer = useRef(null);
  const settleTimer = useRef(null);
  const visualPeriodRef = useRef(period);
  const [visualPeriod, setVisualPeriod] = useState(period);

  useEffect(() => {
    visualPeriodRef.current = period;
    setVisualPeriod(period);
    scrollRef.current?.scrollTo({
      animated: didPositionInitially.current,
      y: (period === 'AM' ? 0 : 1) * WHEEL_ITEM_HEIGHT,
    });
    didPositionInitially.current = true;
  }, [period]);

  const updateVisualFromOffset = (offsetY) => {
    const index = Math.max(0, Math.min(1, Math.round(offsetY / WHEEL_ITEM_HEIGHT)));
    const nextPeriod = index === 0 ? 'AM' : 'PM';

    if (nextPeriod !== visualPeriodRef.current) {
      visualPeriodRef.current = nextPeriod;
      setVisualPeriod(nextPeriod);
    }

    return nextPeriod;
  };

  const handleScrollEnd = (event) => {
    const nextPeriod = updateVisualFromOffset(event.nativeEvent.contentOffset.y);

    if (nextPeriod !== period) {
      updateDraft({ period: nextPeriod });
    }

    onInteractionEnd?.();
  };

  const handleScroll = (event) => {
    updateVisualFromOffset(event.nativeEvent.contentOffset.y);
  };

  const holdInteraction = () => {
    if (releaseTimer.current) {
      clearTimeout(releaseTimer.current);
      releaseTimer.current = null;
    }
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    onInteractionStart?.();
  };

  const settleWithoutMomentum = (event) => {
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
    }
    settleTimer.current = setTimeout(() => {
      handleScrollEnd(event);
      settleTimer.current = null;
    }, 60);
  };

  const releaseInteractionSoon = () => {
    if (releaseTimer.current) {
      clearTimeout(releaseTimer.current);
    }
    releaseTimer.current = setTimeout(() => {
      onInteractionEnd?.();
      releaseTimer.current = null;
    }, 140);
  };

  return (
    <View style={styles.periodWheel}>
      <ScrollView
        accessibilityLabel="AM PM picker"
        bounces={false}
        decelerationRate="fast"
        disableIntervalMomentum={false}
        onMomentumScrollEnd={handleScrollEnd}
        onMomentumScrollBegin={holdInteraction}
        onScroll={handleScroll}
        onScrollBeginDrag={holdInteraction}
        onScrollEndDrag={settleWithoutMomentum}
        onTouchCancel={releaseInteractionSoon}
        onTouchStart={holdInteraction}
        overScrollMode="never"
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_HEIGHT}
      >
        <View style={styles.wheelSpacer} />
      {['AM', 'PM'].map((option) => {
        const selected = visualPeriod === option;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Select ${option}`}
            key={option}
            onPress={() => updateDraft({ period: option })}
            style={({ pressed }) => [
              styles.periodWheelItem,
              pressed && styles.pressedOption,
            ]}
          >
            <Text style={[styles.periodText, selected && styles.periodTextActive]}>{option}</Text>
          </Pressable>
        );
      })}
        <View style={styles.wheelSpacer} />
      </ScrollView>
    </View>
  );
}

export function TimeStep({
  draft,
  onWheelInteractionEnd,
  onWheelInteractionStart,
  updateDraft,
}) {
  return (
    <View>
      <View style={styles.picker}>
        <View pointerEvents="none" style={styles.selectionWindow} />
        <View style={styles.wheelRow}>
          <WheelColumn
            accessibilityLabel="Hour picker"
            onInteractionEnd={onWheelInteractionEnd}
            onInteractionStart={onWheelInteractionStart}
            onChange={(hour) => updateDraft({ hour })}
            value={draft.hour}
            values={HOURS}
            width={82}
          />

          <Text style={styles.colon}>:</Text>

          <WheelColumn
            accessibilityLabel="Minute picker"
            onInteractionEnd={onWheelInteractionEnd}
            onInteractionStart={onWheelInteractionStart}
            onChange={(minute) => updateDraft({ minute })}
            value={draft.minute}
            values={MINUTES}
            width={82}
          />

          <PeriodWheel
            onInteractionEnd={onWheelInteractionEnd}
            onInteractionStart={onWheelInteractionStart}
            period={draft.period}
            updateDraft={updateDraft}
          />
        </View>
        <LinearGradient
          colors={['rgba(255,255,255,0.92)', 'rgba(255,255,255,0)']}
          pointerEvents="none"
          style={styles.topFade}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.92)']}
          pointerEvents="none"
          style={styles.bottomFade}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    height: WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS,
    justifyContent: 'center',
    marginBottom: 0,
    overflow: 'hidden',
    paddingHorizontal: theme.space.sm,
    ...theme.shadows.soft,
  },
  wheelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  selectionWindow: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: 'rgba(255, 106, 0, 0.12)',
    borderWidth: 1,
    borderRadius: theme.radii.md,
    height: WHEEL_ITEM_HEIGHT,
    left: theme.space.sm,
    position: 'absolute',
    right: theme.space.sm,
    top: WHEEL_ITEM_HEIGHT * 2,
  },
  colon: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
    fontSize: 32,
    lineHeight: WHEEL_ITEM_HEIGHT,
    textAlign: 'center',
    width: 28,
  },
  wheelColumn: {
    height: WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS,
    overflow: 'hidden',
  },
  wheelSpacer: {
    height: WHEEL_ITEM_HEIGHT * 2,
  },
  wheelItem: {
    alignItems: 'center',
    height: WHEEL_ITEM_HEIGHT,
    justifyContent: 'center',
  },
  wheelText: {
    color: theme.colors.textLight,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 23,
    lineHeight: WHEEL_ITEM_HEIGHT,
    textAlign: 'center',
  },
  wheelTextActive: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.headingSemiBold,
    fontSize: 30,
  },
  periodWheel: {
    height: WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS,
    marginLeft: theme.space.sm,
    overflow: 'hidden',
    width: 66,
  },
  periodWheelItem: {
    alignItems: 'center',
    height: WHEEL_ITEM_HEIGHT,
    justifyContent: 'center',
  },
  periodText: {
    color: theme.colors.textLight,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.md,
    lineHeight: WHEEL_ITEM_HEIGHT,
  },
  periodTextActive: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.headingSemiBold,
    fontSize: 18,
  },
  pressedOption: {
    opacity: 0.7,
  },
  topFade: {
    height: 66,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  bottomFade: {
    bottom: 0,
    height: 66,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});
