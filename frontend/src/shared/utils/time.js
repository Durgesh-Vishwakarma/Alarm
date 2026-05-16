export function formatAlarmTime(alarm) {
  if (!alarm) {
    return 'Alarm';
  }

  return alarm.timeLabel ?? `${alarm.time} ${alarm.period}`.trim();
}
