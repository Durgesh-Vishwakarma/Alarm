import * as FileSystem from 'expo-file-system/legacy';

/**
 * SnapWake Streak & Gamification Service
 * Orchestrates user progression, XP scaling, and day-based streak logic.
 */

const HISTORY_FILE = `${FileSystem.documentDirectory}snapwake-history-v2.json`;

const DEFAULT_HISTORY = {
  wakeStreak: 0,
  xp: 0,
  completed: 0,
  attempted: 0,
  lastSuccessDate: null, // ISO format YYYY-MM-DD
  achievements: [],
  week: [0, 0, 0, 0, 0, 0, 0],
  events: [],
};

/**
 * Loads user progression stats with production safe-guarding.
 */
export const loadWakeStats = async () => {
  try {
    const info = await FileSystem.getInfoAsync(HISTORY_FILE);
    if (!info.exists) {
      await saveWakeStats(DEFAULT_HISTORY);
      return DEFAULT_HISTORY;
    }

    const raw = await FileSystem.readAsStringAsync(HISTORY_FILE);
    const parsed = JSON.parse(raw);
    
    // Ensure production users start without fake data by merging with zeroed defaults
    return { ...DEFAULT_HISTORY, ...parsed };
  } catch (error) {
    if (__DEV__) console.warn('[Streak] Load failed, using defaults.', error);
    return DEFAULT_HISTORY;
  }
};

/**
 * Persists user progression to local storage.
 */
export const saveWakeStats = async (stats) => {
  try {
    await FileSystem.writeAsStringAsync(HISTORY_FILE, JSON.stringify(stats, null, 2));
  } catch (error) {
    if (__DEV__) console.error('[Streak] Save error:', error);
  }
};

/**
 * Calculates XP based on challenge strictness and user performance.
 * Higher strictness rewards more XP; retries introduce a small penalty.
 */
const calculateXP = (success, strictness, retries) => {
  if (!success) return 0;
  
  let baseXP = 15;
  if (strictness === 'Strict') baseXP = 35;
  if (strictness === 'Lockdown') baseXP = 60;

  const retryPenalty = (retries || 0) * 5;
  return Math.max(5, baseXP - retryPenalty);
};

/**
 * Records the result of a wake event and updates gamification state.
 * Implements day-based streak logic: streaks increment only once per calendar day.
 */
export const recordWakeResult = async ({ 
  alarmId, 
  challengeId, 
  challengeTitle,
  success, 
  confidence, 
  retries = 0, 
  strictness = 'Standard',
  reason = ''
}) => {
  const current = await loadWakeStats();
  const todayStr = new Date().toISOString().split('T')[0];
  
  let newStreak = current.wakeStreak;
  let lastDate = current.lastSuccessDate;

  if (success) {
    // STREAK LOGIC: Only increment once per calendar day to avoid stacking multiple alarms
    if (lastDate !== todayStr) {
      newStreak += 1;
      lastDate = todayStr;
    }
  } else {
    // NOTE: Streaks are currently "Daily Presence" based. 
    // A single failed alarm session doesn't reset the streak; only a missed day does.
    // Future: implement missed-day reset logic in a separate cron-like check.
  }

  const earnedXP = calculateXP(success, strictness, retries);
  
  // Achievement Engine Foundation
  const newAchievements = [...(current.achievements || [])];
  if (success && current.completed === 0 && !newAchievements.includes('First Light')) {
    newAchievements.push('First Light');
  }
  if (success && strictness === 'Lockdown' && !newAchievements.includes('Lockdown Survivor')) {
    newAchievements.push('Lockdown Survivor');
  }

  const next = {
    ...current,
    wakeStreak: newStreak,
    lastSuccessDate: lastDate,
    xp: current.xp + earnedXP,
    completed: success ? current.completed + 1 : current.completed,
    attempted: current.attempted + 1,
    achievements: newAchievements,
    events: [
      {
        alarmId,
        challengeId,
        challengeTitle: challengeTitle || 'AI Challenge',
        strictness,
        success,
        confidence,
        retries,
        reason,
        earnedXP,
        createdAt: new Date().toISOString(),
      },
      ...(current.events || []),
    ].slice(0, 100), // Maintain a rolling history of 100 events
  };

  await saveWakeStats(next);
  return next;
};
