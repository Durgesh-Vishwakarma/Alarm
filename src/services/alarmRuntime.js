const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_LOOKAHEAD_DAYS = 7;

/**
 * Robustly converts time/period to 24-hour hour and minute.
 * Handles malformed data with safe fallbacks (defaulting to 06:00).
 */
export const to24Hour = (time, period) => {
  const [hourText = "6", minuteText = "0"] = String(time || "06:00").split(":");

  let hour = parseInt(hourText, 10);
  let minute = parseInt(minuteText, 10);

  // Robustness fix: Ensure parsed numbers are valid
  if (!Number.isFinite(hour)) hour = 6;
  if (!Number.isFinite(minute)) minute = 0;

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return { hour, minute };
};

/**
 * Generates a unique key for an alarm instance on a specific day.
 * Used for preventing duplicate triggers.
 */
export const getAlarmDateKey = (alarm, date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${alarm.id}-${year}-${month}-${day}-${alarm.time}-${alarm.period}`;
};

/**
 * Determines if an alarm should fire at this exact moment.
 * Allows a short post-target window to avoid missing the minute due to polling delays.
 */
export const shouldAlarmFireNow = (alarm, date = new Date()) => {
  if (!alarm?.isActive) return false;

  const { hour, minute } = to24Hour(alarm.time, alarm.period);

  const target = new Date(date);
  target.setHours(hour, minute, 0, 0);

  const deltaMs = date.getTime() - target.getTime();
  const withinTriggerWindow = deltaMs >= 0 && deltaMs <= 60 * 1000;
  if (!withinTriggerWindow) return false;

  // Day Repeat Logic
  const today = DAYS[date.getDay()];
  const isOneTime = !alarm.repeatDays?.length;
  const repeatsToday = isOneTime || alarm.repeatDays.includes(today);

  return repeatsToday;
};

/**
 * Calculates the next occurrence of an alarm.
 * Distinguishes between one-time and repeating alarms correctly.
 */
export const getNextAlarmDate = (alarm, from = new Date()) => {
  const { hour, minute } = to24Hour(alarm.time, alarm.period);
  const repeatDays = alarm.repeatDays || [];
  const isOneTime = repeatDays.length === 0;

  // Scan ahead to find the next valid day
  for (let offset = 0; offset <= MAX_LOOKAHEAD_DAYS + 1; offset += 1) {
    const candidate = new Date(from);
    candidate.setDate(from.getDate() + offset);
    candidate.setHours(hour, minute, 0, 0);

    const day = DAYS[candidate.getDay()];
    const matchesDayConstraint = isOneTime || repeatDays.includes(day);

    // Explicit timestamp comparison to avoid millisecond drift issues
    if (matchesDayConstraint && candidate.getTime() > from.getTime()) {
      return candidate;
    }
  }

  // Final fallback (safety net)
  const fallback = new Date(from);
  fallback.setDate(from.getDate() + 1);
  fallback.setHours(hour, minute, 0, 0);
  return fallback;
};
