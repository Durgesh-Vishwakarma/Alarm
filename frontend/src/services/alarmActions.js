import { deleteAlarm, normalizeAlarmPayload, saveAlarms, upsertAlarm } from "./alarmStorage";
import { rescheduleAlarm } from "./notificationService";

export const handleToggleAlarm = async (alarms, id, setAlarms) => {
  const alarm = alarms.find(a => a.id === id);
  if (!alarm) return;

  const toggled = { ...alarm, isActive: !alarm.isActive };
  const scheduled = await rescheduleAlarm(alarm, toggled);
  const next = alarms.map(a => a.id === id ? scheduled : a);
  
  setAlarms(next);
  await saveAlarms(next);
};

export const handleSaveAlarmAction = async (alarms, payload, setAlarms) => {
  const normalized = normalizeAlarmPayload(payload);
  const prev = alarms.find((a) => a.id === normalized.id);
  const next = await upsertAlarm(alarms, normalized);
  const saved = next.find((a) => a.id === normalized.id);
  if (!saved) {
    setAlarms(next);
    return;
  }
  const scheduled = await rescheduleAlarm(prev, saved);
  const final = next.map((a) => (a.id === saved.id ? { ...saved, ...scheduled } : a));
  setAlarms(final);
  await saveAlarms(final);
};

export const handleDeleteAlarmAction = async (alarms, id, setAlarms) => {
  const next = await deleteAlarm(alarms, id);
  setAlarms(next);
  await saveAlarms(next);
};
