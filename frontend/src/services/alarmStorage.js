import * as FileSystem from "expo-file-system/legacy";
import { getChallengeById } from "../data/challengeCatalog";
import { RINGTONE_OPTIONS } from "../data/ringtones";

/**
 * SnapWake Production Storage Service
 * Handles persistence with schema versioning, self-healing, and AI metadata support.
 */

const STORAGE_FILE = `${FileSystem.documentDirectory}snapwake-v2-alarms.json`;
const ONBOARDING_KEY = "snapwake-onboarding-complete";
const PERMISSIONS_KEY = "snapwake-permissions-complete";
const STORAGE_VERSION = 2;

// Seed data used only during development
const SEED_ALARMS = [
  {
    id: "seed-1",
    time: "06:00",
    period: "AM",
    label: "Morning Rhythm",
    challengeTitle: "Scan Toothbrush",
    challengeId: "toothbrush",
    targets: ["toothbrush", "mirror"],
    antiCheatStrictness: "Strict",
    verificationMode: "AI Semantic Verification",
    repeatDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    isActive: true,
    completionRate: 100,
  },
];

/**
 * Robust ID generator to prevent collisions across rapid creation and imports.
 */
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const STRICTNESS_TO_AI = {
  gentle: "Standard",
  balanced: "Strict",
  strict: "Lockdown",
};

const RINGTONE_LABEL_TO_KEY = {
  "Morning Glow": "alarm_neon",
  "Neon Alarm": "alarm_neon",
  Cincin: "cincin",
  iPhone: "iphone",
  Ringtone: "ringtone",
  Silent: "Silent",
};

/**
 * Converts modal draft (hour/minute/period, strictness ids, labels) into a persisted alarm shape.
 * Required for HomeScreen cards, getNextAlarmDate, and native/expo schedulers (they expect `time` "HH:MM").
 */
export const normalizeAlarmPayload = (form) => {
  const hour = String(form.hour ?? "07").padStart(2, "0");
  const minute = String(form.minute ?? "00").padStart(2, "0");
  const period = form.period === "PM" ? "PM" : "AM";
  const time = `${hour}:${minute}`;
  const id = form.id || generateId();

  let challengeTitle = form.challengeTitle;
  let targets = Array.isArray(form.targets) ? [...form.targets] : [];

  if (form.challengeId === "custom") {
    challengeTitle = (form.customChallengeTitle || "").trim() || "Custom challenge";
    const hints = (form.customChallengeHints || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    targets = hints.length ? hints : ["photo", "proof"];
  } else {
    const ch = getChallengeById(form.challengeId);
    challengeTitle = challengeTitle || ch.title;
    if (!targets.length) targets = [...(ch.targets || [])];
  }

  const ringRaw = form.ringtone || "alarm_neon";
  const ringKey = RINGTONE_OPTIONS.some((o) => o.value === ringRaw)
    ? ringRaw
    : RINGTONE_LABEL_TO_KEY[ringRaw] || "alarm_neon";

  const antiCheatStrictness =
    STRICTNESS_TO_AI[form.strictness] || form.antiCheatStrictness || "Standard";

  return {
    ...form,
    id,
    hour,
    minute,
    time,
    period,
    challengeTitle,
    targets,
    antiCheatStrictness,
    ringtone: ringKey,
    isActive: form.isActive !== false,
  };
};

/**
 * Loads alarms from storage.
 * Includes self-healing for corrupted files and legacy data normalization.
 */
export const loadAlarms = async () => {
  try {
    const info = await FileSystem.getInfoAsync(STORAGE_FILE);

    if (!info.exists) {
      const initial = __DEV__ ? SEED_ALARMS : [];
      await saveAlarms(initial);
      return initial;
    }

    const raw = await FileSystem.readAsStringAsync(STORAGE_FILE);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (_parseError) {
      if (__DEV__) console.warn("[Storage] Corrupted file, resetting data.");
      await saveAlarms([]);
      return [];
    }

    // Handle both legacy (array-only) and versioned (object) formats
    const alarms = data.version ? data.alarms : data;

    if (!Array.isArray(alarms)) return [];

    // Normalize and repair data (e.g., mapping old 'task' to 'challengeTitle')
    return alarms.map((alarm) => ({
      ...alarm,
      challengeTitle: alarm.challengeTitle || alarm.task || "AI Challenge",
      targets: Array.isArray(alarm.targets) ? alarm.targets : [],
      antiCheatStrictness: alarm.antiCheatStrictness || "Standard",
      verificationMode: alarm.verificationMode || "AI Verification",
      completionRate: alarm.completionRate ?? 100,
    }));
  } catch (error) {
    if (__DEV__) console.warn("[Storage] Critical load error:", error);
    return [];
  }
};

/**
 * Persists alarms with versioning metadata.
 */
export const saveAlarms = async (alarms) => {
  try {
    const payload = {
      version: STORAGE_VERSION,
      alarms,
      lastSavedAt: new Date().toISOString(),
    };
    await FileSystem.writeAsStringAsync(
      STORAGE_FILE,
      JSON.stringify(payload, null, 2),
    );
  } catch (error) {
    if (__DEV__) console.error("[Storage] Save error:", error);
  }
};

/**
 * High-level upsert for alarm creation/editing.
 * Ensures AI metadata (targets, strictness) is properly captured.
 */
export const upsertAlarm = async (alarms, payload) => {
  const now = new Date().toISOString();
  const existingIndex = alarms.findIndex((alarm) => alarm.id === payload.id);
  const isEdit = existingIndex >= 0;
  const id = payload.id || generateId();

  // Normalize naming and ensure AI fields are present
  const normalizedPayload = {
    ...payload,
    id,
    challengeTitle: payload.challengeTitle || payload.task || "AI Challenge",
    targets: Array.isArray(payload.targets) ? payload.targets : [],
    antiCheatStrictness: payload.antiCheatStrictness || "Standard",
    updatedAt: now,
  };

  const nextAlarms = isEdit
    ? alarms.map((alarm) =>
        alarm.id === id ? { ...alarm, ...normalizedPayload } : alarm,
      )
    : [
        {
          ...normalizedPayload,
          createdAt: now,
        },
        ...alarms,
      ];

  await saveAlarms(nextAlarms);
  return nextAlarms;
};

/**
 * Removes an alarm by ID.
 */
export const deleteAlarm = async (alarms, id) => {
  const nextAlarms = alarms.filter((alarm) => alarm.id !== id);
  await saveAlarms(nextAlarms);
  return nextAlarms;
};

/**
 * Onboarding Persistence
 */
export const setOnboardingComplete = async () => {
  await FileSystem.writeAsStringAsync(
    `${FileSystem.documentDirectory}${ONBOARDING_KEY}`,
    "true",
  );
};

export const checkOnboardingComplete = async () => {
  const info = await FileSystem.getInfoAsync(
    `${FileSystem.documentDirectory}${ONBOARDING_KEY}`,
  );
  return info.exists;
};

export const setPermissionsComplete = async () => {
  await FileSystem.writeAsStringAsync(
    `${FileSystem.documentDirectory}${PERMISSIONS_KEY}`,
    "true",
  );
};

export const checkPermissionsComplete = async () => {
  const info = await FileSystem.getInfoAsync(
    `${FileSystem.documentDirectory}${PERMISSIONS_KEY}`,
  );
  return info.exists;
};
