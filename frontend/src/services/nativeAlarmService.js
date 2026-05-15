import { Linking, NativeModules, Platform } from 'react-native';

const nativeScheduler = NativeModules.AlarmScheduler;

function hasNativeScheduler() {
  return Platform.OS === 'android' && Boolean(nativeScheduler);
}

function assertNativeScheduler() {
  if (!hasNativeScheduler()) {
    throw new Error('AlarmScheduler native module is not available.');
  }
}

export async function getAlarmPermissionStatus() {
  if (!hasNativeScheduler()) {
    return {
      canScheduleExactAlarms: true,
      fullScreenIntentAllowed: true,
      overlayAllowed: true,
      ignoringBatteryOptimizations: true,
      backgroundExecutionSupported: true,
    };
  }

  if (typeof nativeScheduler.getAlarmPermissionStatus === 'function') {
    return nativeScheduler.getAlarmPermissionStatus();
  }

  const [canSchedule, ignoringBattery] = await Promise.all([
    canScheduleExactAlarms(),
    isIgnoringBatteryOptimizations(),
  ]);

  return {
    canScheduleExactAlarms: canSchedule,
    fullScreenIntentAllowed: true,
    overlayAllowed: true,
    ignoringBatteryOptimizations: ignoringBattery,
    backgroundExecutionSupported: true,
  };
}

export async function scheduleNativeAlarm(alarm) {
  if (Platform.OS !== 'android') {
    return false;
  }

  assertNativeScheduler();

  if (typeof nativeScheduler.scheduleNativeAlarm === 'function') {
    return nativeScheduler.scheduleNativeAlarm(alarm);
  }

  return nativeScheduler.scheduleAlarm(
    alarm.id,
    alarm.nextTriggerAt,
    alarm.label || alarm.challengeTitle || 'Snapwake Alarm',
    alarm.repeatDays,
    alarm.time,
    alarm.period,
    alarm.ringtone,
  );
}

export async function cancelNativeAlarm(alarmId) {
  if (Platform.OS !== 'android') {
    return false;
  }

  assertNativeScheduler();

  if (typeof nativeScheduler.cancelNativeAlarm === 'function') {
    return nativeScheduler.cancelNativeAlarm(alarmId);
  }

  return nativeScheduler.cancelAlarm(alarmId);
}

export async function stopNativeAlarmService() {
  if (!hasNativeScheduler()) {
    return false;
  }

  return nativeScheduler.stopAlarmService();
}

export async function getActiveNativeAlarmId() {
  if (!hasNativeScheduler()) {
    return null;
  }

  return nativeScheduler.getActiveAlarmId();
}

export async function clearActiveNativeAlarm() {
  if (!hasNativeScheduler()) {
    return false;
  }

  return nativeScheduler.clearActiveAlarm();
}

export async function canScheduleExactAlarms() {
  if (!hasNativeScheduler()) {
    return true;
  }

  return nativeScheduler.canScheduleExactAlarms();
}

export async function requestExactAlarmPermission() {
  if (!hasNativeScheduler()) {
    return false;
  }

  if (typeof nativeScheduler.requestExactAlarmPermission === 'function') {
    return nativeScheduler.requestExactAlarmPermission();
  }

  return nativeScheduler.openExactAlarmSettings();
}

export async function openFullScreenAlarmSettings() {
  if (!hasNativeScheduler()) {
    return Linking.openSettings();
  }

  if (typeof nativeScheduler.openFullScreenAlarmSettings === 'function') {
    return nativeScheduler.openFullScreenAlarmSettings();
  }

  return openAppSettings();
}

export async function openOverlaySettings() {
  if (!hasNativeScheduler()) {
    return Linking.openSettings();
  }

  if (typeof nativeScheduler.openOverlaySettings === 'function') {
    return nativeScheduler.openOverlaySettings();
  }

  return openAppSettings();
}

export async function openAppSettings() {
  if (!hasNativeScheduler()) {
    return Linking.openSettings();
  }

  if (typeof nativeScheduler.openAppSettings === 'function') {
    return nativeScheduler.openAppSettings();
  }

  return Linking.openSettings();
}

export async function isIgnoringBatteryOptimizations() {
  if (!hasNativeScheduler()) {
    return true;
  }

  return nativeScheduler.isIgnoringBatteryOptimizations();
}

export async function requestIgnoreBatteryOptimizations() {
  if (!hasNativeScheduler()) {
    return false;
  }

  if (typeof nativeScheduler.requestIgnoreBatteryOptimizations === 'function') {
    return nativeScheduler.requestIgnoreBatteryOptimizations();
  }

  return nativeScheduler.openIgnoreBatteryOptimizations();
}
