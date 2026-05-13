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
  );
  return true;
};

export const cancelNativeAlarm = async (alarmId) => {
  if (Platform.OS !== "android" || !AlarmScheduler) return false;
  await AlarmScheduler.cancelAlarm(alarmId);
  return true;
};
