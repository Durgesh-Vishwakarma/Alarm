const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const to24Hour = (time, period) => {
  const [hourText = '6', minuteText = '0'] = String(time || '06:00').split(':');
  let hour = Number(hourText);
  const minute = Number(minuteText);

  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  return { hour, minute };
};

export const getAlarmDateKey = (alarm, date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${alarm.id}-${year}-${month}-${day}-${alarm.time}-${alarm.period}`;
};

export const shouldAlarmFireNow = (alarm, date = new Date()) => {
  if (!alarm?.isActive) return false;

  const today = DAYS[date.getDay()];
  const repeatsToday = !alarm.repeatDays?.length || alarm.repeatDays.includes(today);
  if (!repeatsToday) return false;

  const { hour, minute } = to24Hour(alarm.time, alarm.period);
  return date.getHours() === hour && date.getMinutes() === minute;
};

export const getNextAlarmDate = (alarm, from = new Date()) => {
  const { hour, minute } = to24Hour(alarm.time, alarm.period);
  const repeatDays = alarm.repeatDays || [];

  for (let offset = 0; offset < 8; offset += 1) {
    const candidate = new Date(from);
    candidate.setDate(from.getDate() + offset);
    candidate.setHours(hour, minute, 0, 0);

    const day = DAYS[candidate.getDay()];
    const repeatsOnDay = !repeatDays.length || repeatDays.includes(day);
    if (repeatsOnDay && candidate > from) {
      return candidate;
    }
  }

  const fallback = new Date(from);
  fallback.setDate(from.getDate() + 1);
  fallback.setHours(hour, minute, 0, 0);
  return fallback;
};
