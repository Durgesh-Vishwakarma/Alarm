import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../theme';

export function NextAlarmBanner({
  time = '06:00',
  period = 'AM',
  remaining = 'Rings in 7h 12m',
  challenge = 'Scan Toothbrush',
  sound = 'Loud alarm',
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="View next alarm"
      onPress={() =>
        Alert.alert(
          'Next Alarm',
          `${time} ${period}\n${remaining}\nVerification: ${challenge}`
        )
      }
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={['#FF7A18', '#FF9432', '#FFB13B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.headerRow}>
          <View style={styles.labelPill}>
            <Ionicons name="alarm-outline" size={13} color="#FF7A18" />
            <Text style={styles.labelText}>NEXT WAKE-UP</Text>
          </View>

          <Text style={styles.remaining}>{remaining}</Text>
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.time}>{time}</Text>
          <Text style={styles.period}>{period}</Text>
        </View>

        <Text style={styles.helperText}>
          Alarm stops only after successful photo verification.
        </Text>

        
      </LinearGradient>
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
    overflow: 'hidden',
    padding: theme.space.lg,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelPill: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radii.full,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  labelText: {
    color: '#FF7A18',
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  remaining: {
    color: '#FFFFFF',
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
    opacity: 0.95,
  },
  timeRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginTop: theme.space.lg,
  },
  time: {
    color: '#FFFFFF',
    fontFamily: theme.fonts.bodyBold,
    fontSize: 44,
    letterSpacing: -1.5,
    lineHeight: 50,
  },
  period: {
    color: '#FFFFFF',
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15,
    marginBottom: 8,
    marginLeft: 6,
  },
  helperText: {
    color: '#FFFFFF',
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    opacity: 0.9,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: theme.space.md,
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radii.md,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minWidth: 0,
    padding: 10,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: '#FFF0E8',
    borderRadius: theme.radii.full,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  infoCopy: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    color: '#8A8A8A',
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 10,
  },
  infoValue: {
    color: '#1F1F1F',
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
    marginTop: 2,
  },
});