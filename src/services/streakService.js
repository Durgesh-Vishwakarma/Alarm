import * as FileSystem from 'expo-file-system/legacy';

const HISTORY_FILE = `${FileSystem.documentDirectory}snapwake-history.json`;

const DEFAULT_HISTORY = {
  wakeStreak: 6,
  xp: 1240,
  completed: 23,
  attempted: 27,
  achievements: ['No Snooze Hero', '5 Day Spark', 'AI Verified'],
  week: [1, 1, 0, 1, 1, 1, 0],
  events: [],
};

export const loadWakeStats = async () => {
  try {
    const info = await FileSystem.getInfoAsync(HISTORY_FILE);
    if (!info.exists) {
      await saveWakeStats(DEFAULT_HISTORY);
      return DEFAULT_HISTORY;
    }

    const raw = await FileSystem.readAsStringAsync(HISTORY_FILE);
    return { ...DEFAULT_HISTORY, ...JSON.parse(raw) };
  } catch (error) {
    console.warn('Failed to load wake stats.', error);
    return DEFAULT_HISTORY;
  }
};

export const saveWakeStats = async (stats) => {
  await FileSystem.writeAsStringAsync(HISTORY_FILE, JSON.stringify(stats, null, 2));
};

export const recordWakeResult = async ({ alarmId, challengeId, success, confidence }) => {
  const current = await loadWakeStats();
  const next = {
    ...current,
    wakeStreak: success ? current.wakeStreak + 1 : 0,
    xp: success ? current.xp + 35 : current.xp,
    completed: success ? current.completed + 1 : current.completed,
    attempted: current.attempted + 1,
    events: [
      {
        alarmId,
        challengeId,
        success,
        confidence,
        createdAt: new Date().toISOString(),
      },
      ...(current.events || []),
    ].slice(0, 60),
  };

  await saveWakeStats(next);
  return next;
};
