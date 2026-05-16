const DAY_TO_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function to24Hour(hour, period) {
  if (period === 'PM' && hour !== 12) {
    return hour + 12;
  }

  if (period === 'AM' && hour === 12) {
    return 0;
  }

  return hour;
}

export function calculateNextTriggerAt({ hour, minute, period, repeatDays }) {
  const now = new Date();
  const hour24 = to24Hour(hour, period);
  const repeatSet = new Set(repeatDays);

  for (let offset = 0; offset <= 8; offset += 1) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);
    candidate.setHours(hour24, minute, 0, 0);

    const dayAllowed = repeatSet.size === 0 || repeatSet.has(dayName(candidate.getDay()));
    if (dayAllowed && candidate.getTime() > now.getTime()) {
      return candidate.getTime();
    }
  }

  const fallback = new Date(now);
  fallback.setDate(now.getDate() + 1);
  fallback.setHours(hour24, minute, 0, 0);
  return fallback.getTime();
}

export function dayName(dayIndex) {
  return Object.entries(DAY_TO_INDEX).find(([, index]) => index === dayIndex)?.[0] ?? 'Mon';
}
