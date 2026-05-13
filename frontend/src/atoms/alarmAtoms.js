import { atom } from 'jotai';

// Core alarm list
export const alarmsAtom = atom([]);

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
};

export const preferencesAtom = atom(INITIAL_PREFERENCES);
