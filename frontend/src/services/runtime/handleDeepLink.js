import * as Linking from "expo-linking";
import { hydrateWakeSession } from "./restoreAlarm";

export const handleUrl = async (url, state) => {
  if (!url) return;
  const { path, queryParams } = Linking.parse(url);
  if (path !== "wake-up") return;

  const alarmId = queryParams?.alarmId ? String(queryParams.alarmId) : null;
  const ringing = String(queryParams?.ringing || "").toLowerCase() === "true";
  
  await hydrateWakeSession(alarmId, ringing, state);
};
