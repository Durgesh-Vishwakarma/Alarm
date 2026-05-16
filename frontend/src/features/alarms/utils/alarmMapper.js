import { challenges } from '../../newAlarm/data';
import { calculateNextTriggerAt } from './alarmTime';
import { formatDays, getSelectedChallenge } from '../../newAlarm/utils';

export function draftToPersistedAlarm(draft, existingAlarm = {}) {
  const selectedChallenge = getSelectedChallenge(draft);
  const time = `${String(draft.hour).padStart(2, '0')}:${String(draft.minute).padStart(2, '0')}`;
  const now = Date.now();

  return {
    ...existingAlarm,
    id: existingAlarm.id ?? `alarm-${now}`,
    hour: draft.hour,
    minute: draft.minute,
    period: draft.period,
    time,
    timeLabel: `${time} ${draft.period}`,
    repeatDays: draft.days,
    repeatPreset: draft.repeatPreset,
    challengeId: draft.challengeId,
    challengeTitle: selectedChallenge.title,
    customChallengeTitle: draft.customChallengeTitle,
    customChallengeDescription: draft.customChallengeDescription,
    label: draft.label,
    ringtone: ringtoneId(draft.sound),
    sound: draft.sound,
    vibrationEnabled: draft.vibration,
    smartWakeEnabled: draft.smartWake,
    snoozeMinutes: draft.snooze,
    isActive: draft.notification,
    nextTriggerAt: calculateNextTriggerAt({
      hour: draft.hour,
      minute: draft.minute,
      period: draft.period,
      repeatDays: draft.days,
    }),
    createdAt: existingAlarm.createdAt ?? now,
    updatedAt: now,
  };
}

export function persistedAlarmToHomeAlarm(alarm) {
  const challenge = challengeVisual(alarm);

  return {
    id: alarm.id,
    active: alarm.isActive,
    backgroundColor: challenge.backgroundColor,
    icon: challenge.icon,
    iconColor: challenge.iconColor,
    label: alarm.label,
    meridiem: alarm.period,
    nextTriggerAt: alarm.nextTriggerAt,
    schedule:
      alarm.repeatDays.length === 0
        ? 'Ring once'
        : alarm.repeatPreset === 'Daily'
          ? 'Daily  |  Growth Mode'
          : formatDays(alarm.repeatDays),
    time: alarm.time,
    title: alarm.challengeTitle,
  };
}

function challengeVisual(alarm) {
  return (
    challenges.find((challenge) => challenge.id === alarm.challengeId) ??
    challenges.find((challenge) => challenge.title === alarm.challengeTitle) ??
    challenges[0]
  );
}

function ringtoneId(sound) {
  if (sound === 'Soft Chime') {
    return 'cincin';
  }

  if (sound === 'Classic Ring') {
    return 'iphone';
  }

  if (sound === 'Silent') {
    return 'Silent';
  }

  return 'ringtone';
}
