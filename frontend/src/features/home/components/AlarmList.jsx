import { Ionicons } from '@expo/vector-icons';
import { Animated, PanResponder, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useRef } from 'react';

import { theme } from '../../../theme';

const DELETE_REVEAL_WIDTH = 86;

export function AlarmSectionHeader({ activeCount, totalCount, onAddPress }) {
  return (
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.sectionTitle}>Alarms</Text>
        <Text style={styles.sectionMeta}>
          {activeCount} active of {totalCount}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add alarm"
        onPress={onAddPress}
        style={({ pressed }) => [styles.addSmall, pressed && styles.pressed]}
      >
        <Text style={styles.addSmallText}>Add Alarm</Text>
        <Ionicons name="add" size={17} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
}

function AlarmRow({ alarm, onDeleteAlarm, onOpenAlarm, onToggleAlarm }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const openRef = useRef(false);

  const animateTo = (toValue) => {
    Animated.spring(translateX, {
      damping: 18,
      mass: 0.7,
      stiffness: 180,
      toValue,
      useNativeDriver: true,
    }).start(() => {
      openRef.current = toValue !== 0;
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 12 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        const base = openRef.current ? -DELETE_REVEAL_WIDTH : 0;
        const nextX = Math.max(-DELETE_REVEAL_WIDTH, Math.min(0, base + gestureState.dx));
        translateX.setValue(nextX);
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldOpen = gestureState.dx < -32 || (openRef.current && gestureState.dx < 32);
        animateTo(shouldOpen ? -DELETE_REVEAL_WIDTH : 0);
      },
      onPanResponderTerminate: () => {
        animateTo(openRef.current ? -DELETE_REVEAL_WIDTH : 0);
      },
    }),
  ).current;

  return (
    <View style={styles.swipeWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete ${alarm.title}`}
        onPress={() => onDeleteAlarm(alarm.id)}
        style={styles.deleteAction}
      >
        <Ionicons name="trash-outline" size={24} color={theme.colors.white} />
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>

      <Animated.View
        style={[styles.swipeCard, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${alarm.title}`}
          onPress={() => onOpenAlarm(alarm)}
          style={({ pressed }) => [styles.alarmCard, pressed && styles.pressed]}
        >
          <View style={[styles.alarmIcon, { backgroundColor: alarm.backgroundColor }]}>
            <Ionicons name={alarm.icon} size={31} color={alarm.iconColor} />
          </View>

          <View style={styles.alarmCopy}>
            <View style={styles.timeRow}>
              <Text style={styles.time}>{alarm.time}</Text>
              <Text style={styles.meridiem}>{alarm.meridiem}</Text>
            </View>
            <Text style={styles.alarmTitle}>{alarm.title}</Text>
            <View style={styles.scheduleRow}>
              <Ionicons name="calendar-outline" size={10} color={theme.colors.textMuted} />
              <Text numberOfLines={1} style={styles.schedule}>
                {alarm.schedule}
              </Text>
            </View>
          </View>

          <View style={styles.controls}>
            <Text style={[styles.status, alarm.active ? styles.statusOn : styles.statusOff]}>
              {alarm.active ? 'ON' : 'OFF'}
            </Text>
            <Switch
              onChange={() => onToggleAlarm(alarm.id)}
              value={alarm.active}
              trackColor={{ false: '#E3E8EF', true: theme.colors.primary }}
              thumbColor={theme.colors.white}
              ios_backgroundColor="#E3E8EF"
              style={styles.switch}
            />
          </View>

          <Ionicons name="chevron-forward" size={17} color={theme.colors.textLight} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

export function AlarmList({ alarms, onDeleteAlarm, onToggleAlarm, onOpenAlarm }) {
  if (alarms.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Ionicons name="alarm-outline" size={22} color={theme.colors.primary} />
        <View style={styles.emptyCopy}>
          <Text style={styles.emptyTitle}>No alarms yet</Text>
          <Text style={styles.emptyText}>Create your first Snapwake alarm to see it here.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {alarms.map((alarm) => (
        <AlarmRow
          alarm={alarm}
          key={alarm.id}
          onDeleteAlarm={onDeleteAlarm}
          onOpenAlarm={onOpenAlarm}
          onToggleAlarm={onToggleAlarm}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.space.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.lg,
  },
  sectionMeta: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.sm,
    marginTop: 2,
  },
  addSmall: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.space.md,
    height: 47,
    paddingHorizontal: theme.space.lg,
    ...theme.shadows.soft,
  },
  addSmallText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.xs,
  },
  list: {
    gap: theme.space.md,
    paddingTop: theme.space.md,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.space.md,
    marginTop: theme.space.md,
    padding: theme.space.lg,
    ...theme.shadows.soft,
  },
  emptyCopy: {
    flex: 1,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  swipeWrap: {
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
  },
  deleteAction: {
    alignItems: 'center',
    backgroundColor: theme.colors.danger,
    bottom: 0,
    gap: theme.space.xs,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: DELETE_REVEAL_WIDTH,
  },
  deleteText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 11,
  },
  swipeCard: {
    backgroundColor: theme.colors.background,
  },
  alarmCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 105,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.md,
    ...theme.shadows.soft,
  },
  alarmIcon: {
    alignItems: 'center',
    borderRadius: theme.radii.md,
    height: 66,
    justifyContent: 'center',
    marginRight: theme.space.md,
    width: 66,
  },
  alarmCopy: {
    flex: 1,
    minWidth: 0,
  },
  timeRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: theme.space.xs,
  },
  time: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 27,
    lineHeight: 32,
  },
  meridiem: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.xs,
    marginBottom: 4,
  },
  alarmTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.sm,
    marginTop: 2,
  },
  scheduleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.space.xs,
    marginTop: theme.space.sm,
  },
  schedule: {
    color: theme.colors.textMuted,
    flex: 1,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
  },
  controls: {
    alignItems: 'center',
    marginLeft: theme.space.sm,
    width: 48,
  },
  status: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
    marginBottom: 2,
  },
  statusOn: {
    color: theme.colors.primary,
  },
  statusOff: {
    color: theme.colors.textLight,
  },
  switch: {
    transform: [{ scaleX: 0.90 }, { scaleY: 0.90 }],
  },
  pressed: {
    opacity: 0.74,
  },
});
