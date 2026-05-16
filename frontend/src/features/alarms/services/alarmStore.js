import {
  cancelNativeAlarm,
  clearActiveNativeAlarm,
  scheduleNativeAlarm,
  stopNativeAlarmService,
} from './alarmScheduler.native';
import { draftToPersistedAlarm } from '../utils/alarmMapper';
import { calculateNextTriggerAt } from '../utils/alarmTime';
import { loadAlarms, saveAlarms } from './alarmRepository';

export async function loadAlarmState(fallbackAlarms) {
  const storedAlarms = await loadAlarms();
  if (storedAlarms) {
    return storedAlarms;
  }

  await saveAlarms(fallbackAlarms);
  return fallbackAlarms;
}

export async function reconcileActiveAlarmSchedules(alarms) {
  const activeAlarms = alarms.filter((alarm) => alarm.isActive);

  await Promise.all(
    activeAlarms.map(async (alarm) => {
      try {
        console.info('[alarm] reconcile.schedule.request', {
          alarmId: alarm.id,
          nextTriggerAt: alarm.nextTriggerAt,
        });
        await scheduleNativeAlarm(alarm);
        console.info('[alarm] reconcile.schedule.success', {
          alarmId: alarm.id,
          nextTriggerAt: alarm.nextTriggerAt,
        });
      } catch (error) {
        console.warn('[alarm] reconcile.schedule.failed', {
          alarmId: alarm.id,
          message: error.message,
        });
      }
    }),
  );
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
      console.info('[alarm] schedule.request', {
        alarmId: persistedAlarm.id,
        nextTriggerAt: persistedAlarm.nextTriggerAt,
        repeatDays: persistedAlarm.repeatDays,
        ringtone: persistedAlarm.ringtone,
      });
      await scheduleNativeAlarm(persistedAlarm);
      console.info('[alarm] schedule.success', {
        alarmId: persistedAlarm.id,
        nextTriggerAt: persistedAlarm.nextTriggerAt,
      });
    } catch (error) {
      console.warn('[alarm] schedule.failed', {
        alarmId: persistedAlarm.id,
        message: error.message,
      });
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
    console.info('[alarm] toggle.schedule.request', {
      alarmId,
      nextTriggerAt: changedAlarm.nextTriggerAt,
    });
    await scheduleNativeAlarm(changedAlarm);
    console.info('[alarm] toggle.schedule.success', {
      alarmId,
      nextTriggerAt: changedAlarm.nextTriggerAt,
    });
  } else {
    console.info('[alarm] toggle.cancel.request', { alarmId });
    await cancelNativeAlarm(alarmId);
    console.info('[alarm] toggle.cancel.success', { alarmId });
  }

  await saveAlarms(nextAlarms);

  return nextAlarms;
}

export async function deleteAlarm(currentAlarms, alarmId) {
  const nextAlarms = currentAlarms.filter((alarm) => alarm.id !== alarmId);

  console.info('[alarm] delete.cancel.request', { alarmId });
  await cancelNativeAlarm(alarmId);
  console.info('[alarm] delete.cancel.success', { alarmId });
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
