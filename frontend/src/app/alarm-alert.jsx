import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { completeRingingAlarm } from '../features/alarms/alarmStore';
import { loadAlarms } from '../features/alarms/alarmRepository';
import { theme } from '../theme';

export default function AlarmAlertScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const alarmId = String(params.id ?? '');
  const [alarm, setAlarm] = useState(null);
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    loadAlarms()
      .then((alarms) => {
        setAlarm(alarms?.find((item) => item.id === alarmId) ?? null);
      })
      .catch(() => setAlarm(null));
  }, [alarmId]);

  const title = useMemo(() => {
    if (!alarm) {
      return 'SnapWake Alarm';
    }

    return alarm.label || alarm.challengeTitle || 'SnapWake Alarm';
  }, [alarm]);

  const stopAlarm = async () => {
    if (!alarmId || stopping) {
      return;
    }

    setStopping(true);

    try {
      await completeRingingAlarm(alarmId);
      router.replace('/home');
    } catch (error) {
      Alert.alert('Could not stop alarm', error.message);
      setStopping(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.iconWrap}>
          <Ionicons name="alarm" size={72} color={theme.colors.primary} />
        </View>
        <Text style={styles.time}>{alarm?.timeLabel ?? 'Alarm'}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Complete your wake-up challenge to stop the alarm.</Text>

        <View style={styles.challengeCard}>
          <Ionicons name="flashlight" size={38} color={theme.colors.primary} />
          <View style={styles.challengeCopy}>
            <Text style={styles.challengeTitle}>{alarm?.challengeTitle ?? 'Wake challenge'}</Text>
            <Text style={styles.challengeText}>Challenge UI will plug in here.</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Stop alarm"
          disabled={stopping}
          onPress={stopAlarm}
          style={({ pressed }) => [styles.stopButton, pressed && styles.pressed]}
        >
          <Text style={styles.stopText}>{stopping ? 'Stopping...' : 'I am awake'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.space.xl,
  },
  iconWrap: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radii.full,
    height: 124,
    justifyContent: 'center',
    marginBottom: theme.space.xl,
    width: 124,
  },
  time: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.lg,
    marginTop: theme.space.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.md,
    lineHeight: 23,
    marginTop: theme.space.md,
    textAlign: 'center',
  },
  challengeCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.space.lg,
    marginTop: theme.space.xxl,
    padding: theme.space.xl,
    ...theme.shadows.soft,
  },
  challengeCopy: {
    flex: 1,
  },
  challengeTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.md,
  },
  challengeText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.sm,
    marginTop: theme.space.xs,
  },
  stopButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    height: 62,
    justifyContent: 'center',
    marginTop: theme.space.xxl,
    ...theme.shadows.glow,
  },
  stopText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.md,
  },
  pressed: {
    opacity: 0.74,
  },
});
