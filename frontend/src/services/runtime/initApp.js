import * as Linking from "expo-linking";
import { loadAlarms } from "../alarmStorage";
import { requestNotificationPermissions } from "../notificationService";
import { initializeAudio } from "../soundService";
import { ensureExactAlarmPermission, getActiveAlarmId } from "../alarmScheduler";
import { handleUrl } from "./handleDeepLink";
import { hydrateWakeSession } from "./restoreAlarm";

export const initializeApp = async ({ setAlarms, state }) => {
  // 1. Core Services
  await initializeAudio();
  await ensureExactAlarmPermission();
  await requestNotificationPermissions();

  // 2. Load Data
  const stored = await loadAlarms();
  setAlarms(stored);

  // 3. Deep Link Restore
  const initialUrl = await Linking.getInitialURL();
  if (initialUrl) {
    await handleUrl(initialUrl, { ...state, alarms: stored });
    return;
  }

  // 4. Native Restore
  const activeAlarmId = await getActiveAlarmId();
  if (activeAlarmId) {
    await hydrateWakeSession(activeAlarmId, true, { ...state, alarms: stored });
  }
};
