import { shouldAlarmFireNow, getAlarmDateKey } from "../alarmRuntime";
import { startAlarm } from "../alarmEngine";

// Track fired alarms in memory to avoid multiple triggers in the same minute
const firedAlarmsInCurrentSession = new Set();

/**
 * Foreground Alarm Observer
 * Checks all active alarms against the current time every minute.
 */
export const runAlarmCheck = async (state) => {
  const { alarms, setActiveAlarmId, setWakeSession } = state;
  const now = new Date();
  
  // Clear the set at the start of a new minute (simplified)
  if (now.getSeconds() < 2) {
    firedAlarmsInCurrentSession.clear();
  }

  for (const alarm of alarms) {
    if (shouldAlarmFireNow(alarm, now)) {
      const key = getAlarmDateKey(alarm, now);
      
      if (!firedAlarmsInCurrentSession.has(key)) {
        firedAlarmsInCurrentSession.add(key);
        
        if (__DEV__) console.log(`[Observer] Triggering alarm: ${alarm.time} ${alarm.period}`);
        
        await startAlarm(alarm, { setActiveAlarmId, setWakeSession });
        break; // Only trigger one alarm at a time
      }
    }
  }
};

let observerInterval = null;

export const startObserver = (state) => {
  if (observerInterval) return;
  
  // Initial check
  runAlarmCheck(state);
  
  // Check every 10 seconds to ensure we catch the minute window
  observerInterval = setInterval(() => {
    runAlarmCheck(state);
  }, 10000);
};

export const stopObserver = () => {
  if (observerInterval) {
    clearInterval(observerInterval);
    observerInterval = null;
  }
};
