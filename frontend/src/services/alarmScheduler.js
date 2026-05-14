import { NativeModules, Platform } from "react-native";
import { getNextAlarmDate } from "./alarmRuntime";

const { AlarmScheduler } = NativeModules;

export const scheduleNativeAlarm = async (alarm) => {
  if (Platform.OS !== "android" || !AlarmScheduler) return false;
  const next = getNextAlarmDate(alarm, new Date());
  await AlarmScheduler.scheduleAlarm(
    alarm.id,
    next.getTime(),
    alarm.label || "SnapWake Alarm",
    alarm.repeatDays || [],
    alarm.time,
    alarm.period,
    alarm.ringtone || "alarm_neon",
  );
  return true;
};

export const cancelNativeAlarm = async (alarmId) => {
  if (Platform.OS !== "android" || !AlarmScheduler) return false;
  if (alarmId == null || alarmId === "") return false;
  await AlarmScheduler.cancelAlarm(String(alarmId));
  return true;
};

export const stopNativeAlarmService = async () => {
  if (Platform.OS !== "android" || !AlarmScheduler) return false;
  await AlarmScheduler.stopAlarmService();
  return true;
};

export const ensureExactAlarmPermission = async () => {
  if (Platform.OS !== "android" || !AlarmScheduler) return true;

  try {
    const allowed = await AlarmScheduler.canScheduleExactAlarms();
    if (!allowed) {
      await AlarmScheduler.openExactAlarmSettings();
    }
    return allowed;
  } catch (error) {
    if (__DEV__) console.warn("[AlarmScheduler] Exact alarm check failed", error);
    return false;
  }
};

export const ensureBatteryOptimizationDisabled = async () => {
  if (Platform.OS !== "android" || !AlarmScheduler) return true;

  try {
    const isIgnoring = await AlarmScheduler.isIgnoringBatteryOptimizations();
    if (!isIgnoring) {
      await AlarmScheduler.openIgnoreBatteryOptimizations();
    }
    return isIgnoring;
  } catch (error) {
    if (__DEV__) console.warn("[AlarmScheduler] Battery opt check failed", error);
    return false;
  }
};

export const getActiveAlarmId = async () => {
  if (Platform.OS !== "android" || !AlarmScheduler) return null;

  try {
    return await AlarmScheduler.getActiveAlarmId();
  } catch (error) {
    if (__DEV__) console.warn("[AlarmScheduler] Active alarm read failed", error);
    return null;
  }
};

export const clearActiveAlarmId = async () => {
  if (Platform.OS !== "android" || !AlarmScheduler) return false;

  try {
    await AlarmScheduler.clearActiveAlarm();
    return true;
  } catch (error) {
    if (__DEV__) console.warn("[AlarmScheduler] Active alarm clear failed", error);
    return false;
  }
};
