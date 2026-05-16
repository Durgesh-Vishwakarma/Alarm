import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../../shared/theme';
import { formatAlarmTime } from '../../../../shared/utils/time';

export function AlarmHeader({ alarm }) {
  const [time, period = alarm?.period ?? 'AM'] = formatAlarmTime(alarm).split(' ');

  return (
    <View style={styles.wrap}>
      <View style={styles.bellWrap}>
        <Ionicons name="notifications-outline" size={43} color={theme.colors.white} />
        <View style={styles.bellDot} />
      </View>

      <Text style={styles.eyebrow}>Wake Up!</Text>

      <View style={styles.timeRow}>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.period}>{period}</Text>
      </View>

      <Text style={styles.subtitle}>Your alarm is ringing</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: theme.space.xs,
  },
  bellWrap: {
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    marginBottom: 2,
    width: 70,
  },
  bellDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 5,
    height: 8,
    position: 'absolute',
    top: 3,
    width: 8,
  },
  eyebrow: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  timeRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 2,
  },
  time: {
    color: theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: 54,
    lineHeight: 62,
    textShadowColor: 'rgba(120, 47, 0, 0.16)',
    textShadowOffset: { height: 4, width: 0 },
    textShadowRadius: 12,
  },
  period: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 17,
    lineHeight: 32,
    marginLeft: 6,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
