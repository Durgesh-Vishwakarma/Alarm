function refreshStaleActiveTriggers(loadedAlarms, now, calculateNextTriggerAt) {
  return loadedAlarms.map((alarm) => {
    if (!alarm.isActive || alarm.nextTriggerAt > now) {
      return alarm;
    }

    return {
      ...alarm,
      nextTriggerAt: calculateNextTriggerAt({
        hour: alarm.hour,
        minute: alarm.minute,
        period: alarm.period,
        repeatDays: alarm.repeatDays,
      }),
      updatedAt: now,
    };
  });
}

module.exports = {
  refreshStaleActiveTriggers,
};
