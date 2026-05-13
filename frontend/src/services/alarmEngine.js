import { router } from "expo-router";
import { INITIAL_WAKE_SESSION } from "../atoms/alarmAtoms";
import { presentAlarmNotification } from "./notificationService";
import { startAlarmSound, stopAlarmSound } from "./soundService";
import { stopNativeAlarmService } from "./alarmScheduler";

/**
 * Centralized Alarm Engine to manage the lifecycle of a ringing alarm.
 */
export const startAlarm = async (
  dueAlarm,
  { setActiveAlarmId, setWakeSession, setActiveRouteAlarmId },
) => {
  try {
    // Update Global State
    setActiveAlarmId(dueAlarm.id);
    setActiveRouteAlarmId(dueAlarm.id);

    setWakeSession({
      ...INITIAL_WAKE_SESSION,
      status: "ringing",
      alarmId: dueAlarm.id,
      challengeId: dueAlarm.challengeId,
      challengeTitle: dueAlarm.task,
      targets: dueAlarm.targets || [],
      strictness: dueAlarm.antiCheatStrictness || "Strict",
    });

    await presentAlarmNotification(dueAlarm);
    await startAlarmSound(dueAlarm.ringtone);

    // Navigation
    router.replace({
      pathname: "/alarm-alert",
      params: { alarmId: dueAlarm.id, ringing: "true" },
    });
  } catch (error) {
    console.error("Alarm Engine: Failed to start alarm:", error);
  }
};

export const stopAlarm = async ({
  setActiveAlarmId,
  setWakeSession,
  setActiveRouteAlarmId,
}) => {
  try {
    await stopNativeAlarmService();
    await stopAlarmSound();

    // FULL RESET of state to avoid stale data
    setActiveAlarmId(null);
    setActiveRouteAlarmId(null); // CRITICAL: Reset route tracking
    setWakeSession(INITIAL_WAKE_SESSION);
  } catch (error) {
    console.error("Alarm Engine: Failed to stop alarm:", error);
  }
};

export const dismissAlarm = async ({
  setActiveAlarmId,
  setWakeSession,
  setActiveRouteAlarmId,
}) => {
  await stopAlarm({ setActiveAlarmId, setWakeSession, setActiveRouteAlarmId });
  router.replace("/");
};
