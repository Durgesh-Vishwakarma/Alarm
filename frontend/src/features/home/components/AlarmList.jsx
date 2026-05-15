import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { theme } from '../../../theme';

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

export function AlarmList({ alarms, onToggleAlarm, onOpenAlarm }) {
  return (
    <View style={styles.list}>
      {alarms.map((alarm) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${alarm.title}`}
          key={alarm.id}
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
    transform: [{ scaleX: 0.78 }, { scaleY: 0.78 }],
  },
  pressed: {
    opacity: 0.74,
  },
});
