import { completeRingingAlarm } from '../../alarms/services/alarmStore';
import { loadAlarms } from '../../alarms/services/alarmRepository';
import {
  clearActiveNativeAlarm,
  getActiveNativeAlarmId,
  stopNativeAlarmService,
} from '../../../shared/services/nativeAlarmService';

export async function getAlarmSession(alarmId) {
  const resolvedAlarmId = alarmId || (await getActiveNativeAlarmId());
  const alarms = (await loadAlarms()) ?? [];
  const alarm = alarms.find((item) => item.id === resolvedAlarmId) ?? null;

  return { alarm, alarmId: resolvedAlarmId };
}

export async function stopVerifiedAlarm(alarmId) {
  if (alarmId) {
    return completeRingingAlarm(alarmId);
  }

  await stopNativeAlarmService();
  await clearActiveNativeAlarm();
  return null;
}
