import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VerificationFailure } from '../components/result/VerificationFailure';
import { VerificationSuccess } from '../components/result/VerificationSuccess';
import { useAlarmSession } from '../hooks/useAlarmSession';
import { theme } from '../../../shared/theme';
import { getVerificationHomeRedirectDelay } from '../utils/verificationResult';

export function VerificationResultScreen() {
  const params = useLocalSearchParams();
  const alarmId = String(params.id ?? '');
  const success = params.success === 'true';
  const message = String(params.message ?? '');
  const { stopAfterSuccess } = useAlarmSession(alarmId);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  const goHome = () => {
    router.replace('/(tabs)/home');
  };

  useEffect(() => {
    if (!success) return undefined;

    let active = true;
    let timerId;

    stopAfterSuccess().then(() => {
      const redirectDelay = getVerificationHomeRedirectDelay(success);
      if (!redirectDelay) return;

      timerId = setTimeout(() => {
        if (active) {
          goHome();
        }
      }, redirectDelay);
    });

    return () => {
      active = false;
      clearTimeout(timerId);
    };
  }, [stopAfterSuccess, success]);

  const retry = () => {
    router.replace({ pathname: '/alarm-scanner', params: { id: alarmId } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {success ? (
          <VerificationSuccess message={message} onHomePress={goHome} />
        ) : (
          <VerificationFailure message={message} onRetry={retry} />
        )}
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
});
