import { router } from "expo-router";
import { loadAlarms } from "../alarmStorage";
import { clearActiveAlarmId } from "../alarmScheduler";

export const hydrateWakeSession = async (alarmId, ringing, { setActiveAlarmId, setWakeSession, alarms = [] }) => {
  if (!alarmId || !ringing) return;

  const current = alarms.length ? alarms : await loadAlarms();
  const matched = current.find((alarm) => alarm.id === alarmId);
  if (!matched) return;

  setActiveAlarmId(matched.id);
  setWakeSession({
    status: "ringing",
    alarmId: matched.id,
    challengeId: matched.challengeId,
    challengeTitle: matched.task,
    targets: matched.targets || [],
    strictness: matched.antiCheatStrictness || "Strict",
    retries: 0,
    error: null,
    startTime: Date.now(),
  });

  await clearActiveAlarmId();
  router.replace({
    pathname: "/alarm-alert",
    params: { alarmId: matched.id, ringing: "true" },
  });
};
