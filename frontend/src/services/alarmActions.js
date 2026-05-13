import { saveAlarms, upsertAlarm, deleteAlarm } from "./alarmStorage";
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
  const prev = alarms.find(a => a.id === payload.id);
  const scheduled = await rescheduleAlarm(prev, payload);
  const next = await upsertAlarm(alarms, scheduled);
  
  setAlarms(next);
  await saveAlarms(next);
};

export const handleDeleteAlarmAction = async (alarms, id, setAlarms) => {
  const next = await deleteAlarm(alarms, id);
  setAlarms(next);
  await saveAlarms(next);
};
