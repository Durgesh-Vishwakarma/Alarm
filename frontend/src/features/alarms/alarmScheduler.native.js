import {
  canScheduleExactAlarms,
  cancelNativeAlarm,
  clearActiveNativeAlarm,
  getActiveNativeAlarmId,
  isIgnoringBatteryOptimizations,
  requestExactAlarmPermission,
  requestIgnoreBatteryOptimizations,
  scheduleNativeAlarm,
  stopNativeAlarmService,
} from '../../services/nativeAlarmService';

export {
  canScheduleExactAlarms,
  cancelNativeAlarm,
  clearActiveNativeAlarm,
  getActiveNativeAlarmId,
  isIgnoringBatteryOptimizations,
  scheduleNativeAlarm,
  stopNativeAlarmService,
};

export function openExactAlarmSettings() {
  return requestExactAlarmPermission();
}

export function openIgnoreBatteryOptimizations() {
  return requestIgnoreBatteryOptimizations();
}
