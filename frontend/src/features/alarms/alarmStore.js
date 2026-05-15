import {
  cancelNativeAlarm,
  clearActiveNativeAlarm,
  scheduleNativeAlarm,
  stopNativeAlarmService,
} from './alarmScheduler.native';
import { draftToPersistedAlarm } from './alarmMapper';
import { calculateNextTriggerAt } from './alarmTime';
import { loadAlarms, saveAlarms } from './alarmRepository';

export async function loadAlarmState(fallbackAlarms) {
  const storedAlarms = await loadAlarms();
  if (storedAlarms) {
    return storedAlarms;
  }

  await saveAlarms(fallbackAlarms);
  return fallbackAlarms;
}

export async function saveAlarmDraft(currentAlarms, draft, editingAlarmId) {
  const existingAlarm = currentAlarms.find((alarm) => alarm.id === editingAlarmId);
  const persistedAlarm = draftToPersistedAlarm(draft, existingAlarm);
  const nextAlarms = existingAlarm
    ? currentAlarms.map((alarm) => (alarm.id === existingAlarm.id ? persistedAlarm : alarm))
    : [persistedAlarm, ...currentAlarms];

  await saveAlarms(nextAlarms);

  if (persistedAlarm.isActive) {
    try {
      await scheduleNativeAlarm(persistedAlarm);
    } catch (error) {
      const disabledAlarms = nextAlarms.map((alarm) =>
        alarm.id === persistedAlarm.id
          ? { ...alarm, isActive: false, scheduleError: error.message }
          : alarm,
      );
      await saveAlarms(disabledAlarms);
      const saveError = new Error(
        'Alarm was saved, but Android scheduling failed. Check exact alarm permission.',
      );
      saveError.nextAlarms = disabledAlarms;
      throw saveError;
    }
  } else {
    await cancelNativeAlarm(persistedAlarm.id);
  }

  return nextAlarms;
}

export async function setAlarmEnabled(currentAlarms, alarmId, enabled) {
  const nextAlarms = currentAlarms.map((alarm) =>
    alarm.id === alarmId
      ? {
          ...alarm,
          isActive: enabled,
          nextTriggerAt: enabled
            ? calculateNextTriggerAt({
                hour: alarm.hour,
                minute: alarm.minute,
                period: alarm.period,
                repeatDays: alarm.repeatDays,
              })
            : alarm.nextTriggerAt,
          updatedAt: Date.now(),
        }
      : alarm,
  );
  const changedAlarm = nextAlarms.find((alarm) => alarm.id === alarmId);

  if (changedAlarm && enabled) {
    await scheduleNativeAlarm(changedAlarm);
  } else {
    await cancelNativeAlarm(alarmId);
  }

  await saveAlarms(nextAlarms);

  return nextAlarms;
}

export async function deleteAlarm(currentAlarms, alarmId) {
  const nextAlarms = currentAlarms.filter((alarm) => alarm.id !== alarmId);

  await cancelNativeAlarm(alarmId);
  await saveAlarms(nextAlarms);

  return nextAlarms;
}

export async function completeRingingAlarm(alarmId) {
  const currentAlarms = (await loadAlarms()) ?? [];
  const now = Date.now();
  const nextAlarms = currentAlarms.map((alarm) =>
    alarm.id === alarmId
      ? {
          ...alarm,
          lastCompletedAt: now,
          status: 'completed',
          updatedAt: now,
        }
      : alarm,
  );

  await stopNativeAlarmService();
  await clearActiveNativeAlarm();
  await saveAlarms(nextAlarms);

  return nextAlarms.find((alarm) => alarm.id === alarmId) ?? null;
}
