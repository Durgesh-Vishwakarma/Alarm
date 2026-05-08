import * as FileSystem from 'expo-file-system/legacy';

const STORAGE_FILE = `${FileSystem.documentDirectory}snapwake-alarms.json`;

const DEFAULT_ALARMS = [
  {
    id: '1',
    time: '06:00',
    period: 'AM',
    label: 'Morning Workout',
    task: 'Scan Toothbrush',
    challengeId: 'toothbrush',
    difficulty: 'Focused',
    antiCheatStrictness: 'Strict',
    repeatDays: ['Mon', 'Wed', 'Fri'],
    isActive: true,
    completionRate: 92,
  },
  {
    id: '2',
    time: '07:30',
    period: 'AM',
    label: 'Deep Work',
    task: 'Capture Sky',
    challengeId: 'sky',
    difficulty: 'Easy',
    antiCheatStrictness: 'Standard',
    repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    isActive: false,
    completionRate: 76,
  },
  {
    id: '3',
    time: '08:00',
    period: 'AM',
    label: 'Leave for Office',
    task: 'Capture Running Tap',
    challengeId: 'running_tap',
    difficulty: 'Strict',
    antiCheatStrictness: 'Lockdown',
    repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    isActive: true,
    completionRate: 88,
  },
];

export const loadAlarms = async () => {
  try {
    const info = await FileSystem.getInfoAsync(STORAGE_FILE);
    if (!info.exists) {
      await saveAlarms(DEFAULT_ALARMS);
      return DEFAULT_ALARMS;
    }

    const raw = await FileSystem.readAsStringAsync(STORAGE_FILE);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_ALARMS;
  } catch (error) {
    console.warn('Failed to load alarms, using defaults.', error);
    return DEFAULT_ALARMS;
  }
};

export const saveAlarms = async (alarms) => {
  await FileSystem.writeAsStringAsync(STORAGE_FILE, JSON.stringify(alarms, null, 2));
};

export const upsertAlarm = async (alarms, payload) => {
  const nextAlarms = payload.id
    ? alarms.map((alarm) => (alarm.id === payload.id ? { ...alarm, ...payload } : alarm))
    : [{ ...payload, id: Date.now().toString() }, ...alarms];

  await saveAlarms(nextAlarms);
  return nextAlarms;
};

export const deleteAlarm = async (alarms, id) => {
  const nextAlarms = alarms.filter((alarm) => alarm.id !== id);
  await saveAlarms(nextAlarms);
  return nextAlarms;
};
