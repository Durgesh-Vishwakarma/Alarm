import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { AlarmActions } from '../components/alarm/AlarmActions';
import { AlarmChallengeCard } from '../components/alarm/AlarmChallengeCard';
import { AlarmHeader } from '../components/alarm/AlarmHeader';
import { AlarmStatusView } from '../components/alarm/AlarmStatusView';
import { AlarmTimer } from '../components/alarm/AlarmTimer';
import { useAlarmSession } from '../hooks/useAlarmSession';
import { theme } from '../../../shared/theme';

export function AlarmRingScreen() {
  const params = useLocalSearchParams();
  const alarmId = String(params.id ?? '');
  const { alarm, error, loading, openScanner } = useAlarmSession(alarmId);

  return (
    <LinearGradient colors={['#F25A12', '#FF7A00', '#FF5A00']} style={styles.gradient}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View pointerEvents="none" style={styles.ringLarge} />
        <View pointerEvents="none" style={styles.ringMid} />
        <View pointerEvents="none" style={styles.ringSmall} />

        <View style={styles.screen}>
          {loading ? <Text style={styles.helper}>Loading alarm...</Text> : null}
          {!loading && error ? <Text style={styles.helper}>{error}</Text> : null}

          {alarm ? (
            <>
              <AlarmHeader alarm={alarm} />
              <AlarmStatusView />
              <AlarmChallengeCard alarm={alarm} />
              <AlarmActions onStart={openScanner} />
              <AlarmTimer />
            </>
          ) : null}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
    gap: 12,
    justifyContent: 'space-between',
    paddingBottom: theme.space.md,
    paddingHorizontal: 20,
    paddingTop: theme.space.sm,
  },
  helper: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    textAlign: 'center',
  },
  ringLarge: {
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 220,
    borderWidth: 1,
    height: 440,
    left: -34,
    position: 'absolute',
    top: 88,
    width: 440,
  },
  ringMid: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 170,
    borderWidth: 1,
    height: 340,
    left: 16,
    position: 'absolute',
    top: 138,
    width: 340,
  },
  ringSmall: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 130,
    height: 260,
    left: 56,
    position: 'absolute',
    top: 178,
    width: 260,
  },
});
