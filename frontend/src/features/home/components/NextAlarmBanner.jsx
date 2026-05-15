import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../theme';

export function NextAlarmBanner({ alarm, onPress }) {
  const hasAlarm = Boolean(alarm);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hasAlarm ? `Open next alarm at ${alarm.timeLabel}` : 'No active alarm'}
      onPress={hasAlarm ? onPress : undefined}
      style={({ pressed }) => [styles.wrap, pressed && hasAlarm && styles.pressed]}
    >
      <View style={[styles.banner, hasAlarm ? styles.activeBanner : styles.emptyBanner]}>
        {hasAlarm ? <View pointerEvents="none" style={styles.highlight} /> : null}

        <View style={styles.headerRow}>
          <View style={[styles.labelPill, !hasAlarm && styles.emptyPill]}>
            <Ionicons
              name={hasAlarm ? 'alarm-outline' : 'alarm-outline'}
              size={13}
              color={theme.colors.primary}
            />
            <Text style={styles.labelText}>{hasAlarm ? 'NEXT WAKE-UP' : 'NO ACTIVE ALARM'}</Text>
          </View>

          <Text style={[styles.remaining, !hasAlarm && styles.emptyText]}>
            {hasAlarm ? alarm.remaining : 'Stay on Home'}
          </Text>
        </View>

        {hasAlarm ? (
          <>
            <View style={styles.timeRow}>
              <Text style={styles.time}>{alarm.time}</Text>
              <Text style={styles.period}>{alarm.period}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.challengeIcon}>
                <Ionicons name={alarm.icon} size={17} color={alarm.iconColor} />
              </View>
              <View style={styles.detailCopy}>
                <Text numberOfLines={1} style={styles.challenge}>
                  {alarm.challengeTitle}
                </Text>
                <Text numberOfLines={1} style={styles.schedule}>
                  {alarm.detailText}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.emptyTitle}>Turn on an alarm to see the next wake-up here.</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: theme.radii.lg,
    ...theme.shadows.glow,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  banner: {
    borderRadius: theme.radii.lg,
    minHeight: 160,
    overflow: 'hidden',
    padding: theme.space.lg,
  },
  activeBanner: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
  },
  highlight: {
    backgroundColor: 'rgba(255, 190, 80, 0.58)',
    borderRadius: 120,
    height: 150,
    position: 'absolute',
    right: -42,
    top: -45,
    width: 190,
  },
  emptyBanner: {
     backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelPill: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.full,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  emptyPill: {
    backgroundColor: theme.colors.primarySoft,
  },
  labelText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
  },
  remaining: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
  },
  emptyText: {
    color: theme.colors.white,
  },
  timeRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginTop: theme.space.lg,
  },
  time: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 40,
    lineHeight: 46,
  },
  period: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 14,
    marginBottom: 7,
    marginLeft: 6,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.space.sm,
    marginTop: theme.space.md,
  },
  challengeIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
  },
  challenge: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
  },
  schedule: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 11,
    marginTop: 2,
    opacity: 0.88,
  },
  emptyTitle: {
    color:theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: 17,
    lineHeight: 23,
    marginTop: theme.space.lg,
  },
});
