import { useAtom, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import {
    activeAlarmIdAtom,
    activeRouteAlarmIdAtom,
    alarmsAtom,
    wakeSessionAtom,
} from "../atoms/alarmAtoms";
import { loadAlarms } from "../services/alarmStorage";
import { requestNotificationPermissions } from "../services/notificationService";
import { initializeAudio } from "../services/soundService";
import {
  clearActiveAlarmId,
  ensureExactAlarmPermission,
  getActiveAlarmId,
} from "../services/alarmScheduler";

export const AlarmRuntimeProvider = ({ children }) => {
  const [alarms, setAlarms] = useAtom(alarmsAtom);
  const setActiveAlarmId = useSetAtom(activeAlarmIdAtom);
  const setWakeSession = useSetAtom(wakeSessionAtom);
  const [activeRouteAlarmId, setActiveRouteAlarmId] = useAtom(
    activeRouteAlarmIdAtom,
  );

  // Stable ref to avoid interval recreation
  const alarmsRef = useRef([]);
  const setupPromise = useRef(null);

  // Sync ref with latest atom state
  useEffect(() => {
    alarmsRef.current = alarms;
  }, [alarms]);

  const hydrateWakeSession = async (alarmId, ringing) => {
    if (!alarmId || !ringing) return;

    const current = alarmsRef.current.length ? alarmsRef.current : await loadAlarms();
    const matched = current.find((alarm) => alarm.id === alarmId);
    if (!matched) return;

    setActiveAlarmId(matched.id);
    setActiveRouteAlarmId(matched.id);
    setWakeSession({
      status: "ringing",
      alarmId: matched.id,
      challengeId: matched.challengeId,
      challengeTitle: matched.task,
      targets: matched.targets || [],
      strictness: matched.antiCheatStrictness || "Strict",
      retries: 0,
      error: null,
      startTime: Date.now(),
    });

    await clearActiveAlarmId();
    router.replace({
      pathname: "/alarm-alert",
      params: { alarmId: matched.id, ringing: "true" },
    });
  };

  const handleUrl = async (url) => {
    if (setupPromise.current) {
      await setupPromise.current;
    }
    if (!url) return;
    const { path, queryParams } = Linking.parse(url);
    if (path !== "wake-up") return;

    const alarmId = queryParams?.alarmId
      ? String(queryParams.alarmId)
      : null;
    const ringing = String(queryParams?.ringing || "").toLowerCase() === "true";
    await hydrateWakeSession(alarmId, ringing);
  };

  // One-time setup
  useEffect(() => {
    const setup = async () => {
      // 1. Initialize audio mode once
      await initializeAudio();

      // 1a. Ensure exact alarm permission on Android 12+
      await ensureExactAlarmPermission();

      // 1b. Ensure notification permission for background alarms
      await requestNotificationPermissions();

      // 2. Load alarms from storage
      const stored = await loadAlarms();
      setAlarms(stored);

      // 3. Restore alarm state if app was opened from a deep link
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleUrl(initialUrl);
        return;
      }

      // 4. Fallback: if the native service is active, restore from it
      const activeAlarmId = await getActiveAlarmId();
      if (activeAlarmId) {
        await hydrateWakeSession(activeAlarmId, true);
      }
    };
    setupPromise.current = setup();
  }, [setAlarms]);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return children;
};
