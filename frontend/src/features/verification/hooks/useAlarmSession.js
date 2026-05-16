import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';

import { getAlarmSession, stopVerifiedAlarm } from '../services/alarmService';

export function useAlarmSession(alarmId) {
  const [alarm, setAlarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const session = await getAlarmSession(alarmId);
      setAlarm(session.alarm);
      setError(session.alarm ? null : 'Alarm details are not available.');
    } catch (sessionError) {
      setError(sessionError.message);
    } finally {
      setLoading(false);
    }
  }, [alarmId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  const openScanner = useCallback(() => {
    if (!alarmId) return;
    router.push({ pathname: '/alarm-scanner', params: { id: alarmId } });
  }, [alarmId]);

  const stopAfterSuccess = useCallback(async () => {
    await stopVerifiedAlarm(alarmId);
  }, [alarmId]);

  return {
    alarm,
    error,
    loading,
    openScanner,
    refresh,
    stopAfterSuccess,
  };
}
