import { atom } from 'jotai';

// Core alarm list
export const alarmsAtom = atom([]);

/** Alarm editor draft — survives re-renders; reset only when opening/closing flows set it */
export const INITIAL_ALARM_DRAFT = {
  hour: "07",
  minute: "30",
  period: "AM",
  label: "",
  repeatDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  challengeId: "toothbrush",
  strictness: "balanced",
  ringtone: "alarm_neon",
  vibrate: true,
  snoozeLimit: 1,
  isActive: true,
  customChallengeTitle: "",
  customChallengeHints: "",
};

export const alarmDraftAtom = atom({ ...INITIAL_ALARM_DRAFT });
export const alarmModalVisibleAtom = atom(false);
/** null = creating new alarm; string id = editing */
export const alarmEditingIdAtom = atom(null);

// The currently ringing/active alarm ID
export const activeAlarmIdAtom = atom(null);

// Derived: Returns the full alarm object for the active ID
export const activeAlarmAtom = atom((get) => {
  const alarms = get(alarmsAtom);
  const activeId = get(activeAlarmIdAtom);
  return alarms.find((a) => a.id === activeId) || null;
});

// Initial wake session state
export const INITIAL_WAKE_SESSION = {
  alarmId: null,
  challengeId: null,
  status: 'idle',
  retries: 0,
  error: null,
  startTime: null,
};

// Current session for the WakeUp screen
export const wakeSessionAtom = atom(INITIAL_WAKE_SESSION);

// Global app preferences
export const INITIAL_PREFERENCES = {
  aiVerificationEnabled: true,
  defaultStrictness: 'Strict',
  vibrationEnabled: true,
  hapticsEnabled: true,
  offlineFallback: false,
  autoLaunchCamera: true,
  smartWakeEnabled: true,
};

export const preferencesAtom = atom(INITIAL_PREFERENCES);
