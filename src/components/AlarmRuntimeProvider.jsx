import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, Vibration } from 'react-native';
import { loadAlarms } from '../services/alarmStorage';
import { getAlarmDateKey, shouldAlarmFireNow } from '../services/alarmRuntime';

const CHECK_INTERVAL_MS = 1000;
const VIBRATION_PATTERN = [0, 900, 300, 900, 300, 1400];

export const AlarmRuntimeProvider = ({ children }) => {
  const triggeredKeys = useRef(new Set());
  const activeRouteAlarm = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const checkAlarms = async () => {
      const alarms = await loadAlarms();
      const now = new Date();
      const dueAlarm = alarms.find((alarm) => {
        const key = getAlarmDateKey(alarm, now);
        return shouldAlarmFireNow(alarm, now) && !triggeredKeys.current.has(key);
      });

      if (!dueAlarm || !isMounted) return;

      const triggerKey = getAlarmDateKey(dueAlarm, now);
      triggeredKeys.current.add(triggerKey);
      activeRouteAlarm.current = dueAlarm.id;
      Vibration.vibrate(VIBRATION_PATTERN, true);

      router.push({
        pathname: '/wake-up',
        params: {
          alarmId: dueAlarm.id,
          challengeId: dueAlarm.challengeId,
          ringing: 'true',
        },
      });
    };

    const start = () => {
      checkAlarms();
      intervalId = setInterval(checkAlarms, CHECK_INTERVAL_MS);
    };

    start();

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkAlarms();
      }
    });

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      appStateSubscription.remove();
      Vibration.cancel();
    };
  }, []);

  return children;
};
