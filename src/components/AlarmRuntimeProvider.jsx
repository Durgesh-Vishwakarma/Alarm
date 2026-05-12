import { useAtom, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import {
    activeAlarmIdAtom,
    activeRouteAlarmIdAtom,
    alarmsAtom,
    wakeSessionAtom,
} from "../atoms/alarmAtoms";
import { startAlarm } from "../services/alarmEngine";
import { getAlarmDateKey, shouldAlarmFireNow } from "../services/alarmRuntime";
import { loadAlarms } from "../services/alarmStorage";
import { requestNotificationPermissions } from "../services/notificationService";
import { initializeAudio } from "../services/soundService";

const CHECK_INTERVAL_MS = 5000;
const TRIGGER_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export const AlarmRuntimeProvider = ({ children }) => {
  const [alarms, setAlarms] = useAtom(alarmsAtom);
  const setActiveAlarmId = useSetAtom(activeAlarmIdAtom);
  const setWakeSession = useSetAtom(wakeSessionAtom);
  const [activeRouteAlarmId, setActiveRouteAlarmId] = useAtom(
    activeRouteAlarmIdAtom,
  );

  // Stable ref to avoid interval recreation
  const alarmsRef = useRef([]);
  const triggeredKeys = useRef(new Map()); // Map<key, timestamp>

  // Sync ref with latest atom state
  useEffect(() => {
    alarmsRef.current = alarms;
  }, [alarms]);

  // One-time setup
  useEffect(() => {
    const setup = async () => {
      // 1. Initialize audio mode once
      await initializeAudio();

      // 1b. Ensure notification permission for background alarms
      await requestNotificationPermissions();

      // 2. Load alarms from storage
      const stored = await loadAlarms();
      setAlarms(stored);
    };
    setup();
  }, [setAlarms]);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const checkAlarms = async () => {
      const now = new Date();
      const nowTs = now.getTime();

      // Safe Cleanup: Expire old trigger keys
      for (const [key, timestamp] of triggeredKeys.current.entries()) {
        if (nowTs - timestamp > TRIGGER_EXPIRY_MS) {
          triggeredKeys.current.delete(key);
        }
      }

      // Check against current ref
      const dueAlarms = alarmsRef.current.filter((alarm) => {
        const key = getAlarmDateKey(alarm, now);
        const hasTriggered = triggeredKeys.current.has(key);
        return (
          alarm.isActive && shouldAlarmFireNow(alarm, now) && !hasTriggered
        );
      });

      if (dueAlarms.length === 0 || !isMounted) return;

      const dueAlarm = dueAlarms[0];

      // CRITICAL: Check global activeRouteAlarmIdAtom to prevent duplicate routing
      if (activeRouteAlarmId === dueAlarm.id) return;

      const triggerKey = getAlarmDateKey(dueAlarm, now);
      triggeredKeys.current.set(triggerKey, nowTs);

      // Start the alarm lifecycle via central engine
      await startAlarm(dueAlarm, {
        setActiveAlarmId,
        setWakeSession,
        setActiveRouteAlarmId,
      });
    };

    const start = () => {
      checkAlarms();
      intervalId = setInterval(checkAlarms, CHECK_INTERVAL_MS);
    };

    start();

    const appStateSubscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") {
          checkAlarms();
        }
      },
    );

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
  }, [activeRouteAlarmId, setActiveAlarmId, setActiveRouteAlarmId, setWakeSession]);

  return children;
};
