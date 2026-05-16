import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../../shared/theme';

export function AlarmTimer({ text = 'Alarm is ringing' }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.side}>
        <View style={styles.circle}>
          <Ionicons name="lock-closed-outline" size={22} color={theme.colors.white} />
        </View>
      </View>

      <Text style={styles.text}>Alarm will keep ringing{'\n'}until verification is successful</Text>

      <View style={styles.side}>
        <View style={styles.circle}>
          <Ionicons name="notifications-off-outline" size={23} color={theme.colors.white} />
        </View>
        <Text style={styles.caption}>Cannot Dismiss</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.space.sm,
    justifyContent: 'space-between',
  },
  side: {
    alignItems: 'center',
    minWidth: 78,
  },
  circle: {
    alignItems: 'center',
    backgroundColor: 'rgba(210, 78, 8, 0.46)',
    borderColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: 27,
    borderWidth: 1,
    height: 54,
    justifyContent: 'center',
    shadowColor: '#7E2A00',
    shadowOffset: { height: 9, width: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 13,
    width: 54,
  },
  text: {
    color: theme.colors.white,
    flex: 1,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  caption: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
    marginTop: theme.space.xs,
    textAlign: 'center',
  },
});
