import { atom } from 'jotai';

/**
 * SnapWake Global State Atoms
 * Orchestrates real-time synchronization between the background engine and UI.
 */

// Core alarm list
export const alarmsAtom = atom([]);

// The currently ringing/active alarm ID
export const activeAlarmIdAtom = atom(null);

/**
 * DERIVED ATOM: activeAlarmAtom
 * Returns the full alarm object for the currently ringing alarm.
 */
export const activeAlarmAtom = atom((get) => {
  const alarms = get(alarmsAtom);
  const activeId = get(activeAlarmIdAtom);
  return alarms.find((a) => a.id === activeId) || null;
});

// Protection: Tracks if the app is currently on a specific alarm route
export const activeRouteAlarmIdAtom = atom(null);

// Initial empty wake session state
export const INITIAL_WAKE_SESSION = {
  alarmId: null,
  challengeId: null,
  status: 'idle', // idle, capturing, verifying, success, failed
  retries: 0,
  error: null,
  startTime: null,
};

// Real-time session for the WakeUp screen
export const wakeSessionAtom = atom(INITIAL_WAKE_SESSION);

/**
 * PRODUCTION PREFERENCES
 * Tracks global app settings, AI strictness, and system permissions.
 */
export const INITIAL_PREFERENCES = {
  aiVerificationEnabled: true,
  defaultStrictness: 'Strict',
  vibrationEnabled: true,
  hapticsEnabled: true,
  offlineFallback: false,
  autoLaunchCamera: true,
};

export const preferencesAtom = atom(INITIAL_PREFERENCES);
