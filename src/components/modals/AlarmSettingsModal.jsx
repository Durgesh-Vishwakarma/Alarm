import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  AI_CHALLENGES,
  DIFFICULTY_LEVELS,
  STRICTNESS_LEVELS,
  getChallengeById,
} from "../../data/challengeCatalog";
import { RINGTONE_OPTIONS } from "../../data/ringtones";
import { startAlarmSound, stopAlarmSound } from "../../services/soundService";
import { colors, typography } from "../../theme";
import WheelTimePicker from "../WheelPicker";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const extractTargets = (text = "") => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter((word) => word.length > 2)
    .slice(0, 5);
};

const CUSTOM_CHALLENGE = {
  id: "custom",
  title: "Custom Challenge",
  icon: "create-outline",
  difficulty: "Focused",
  estimatedTime: "Varies",
  targets: [],
  verificationTips: "Describe exactly what you want the AI to look for.",
  category: "Custom",
  cameraRequired: true,
};

const ALL_CHALLENGES = [...AI_CHALLENGES, CUSTOM_CHALLENGE];

const getDefaultForm = () => ({
  hour: "06",
  minute: "00",
  period: "AM",
  label: "",
  task: ALL_CHALLENGES[0].title,
  challengeId: ALL_CHALLENGES[0].id,
  customTask: "",
  targets: ALL_CHALLENGES[0].targets || [],
  difficulty: ALL_CHALLENGES[0].difficulty,
  antiCheatStrictness: "Strict",
  ringtone: RINGTONE_OPTIONS[0].value,
  snoozeMinutes: 5,
  repeatDays: [...DAYS],
  isActive: true,
});

const Section = ({ title, icon, children, delay = 0 }) => (
  <Animated.View
    entering={FadeInDown.delay(delay).duration(400).springify()}
    style={s.section}
  >
    <View style={s.sectionHeader}>
      <View style={s.sectionIconWrap}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
    {children}
  </Animated.View>
);

const parseTime = (time) => {
  const [h = "06", m = "00"] = (time || "06:00").split(":");
  return { hour: h.padStart(2, "0"), minute: m.padStart(2, "0") };
};

const AlarmSettingsModal = ({
  visible,
  editingAlarm,
  onClose,
  onSave,
  permissionStatus = "Not requested",
  onRequestPermission,
}) => {
  const [form, setForm] = useState(getDefaultForm);
  const isPreviewingRef = useRef(false);
  const suppressStopRef = useRef(false);

  useEffect(() => {
    if (!visible) return;
    if (editingAlarm) {
      const { hour, minute } = parseTime(editingAlarm.time);
      const activeChallenge =
        ALL_CHALLENGES.find((c) => c.id === editingAlarm.challengeId) ||
        ALL_CHALLENGES[0];
      setForm({
        hour,
        minute,
        period: editingAlarm.period || "AM",
        label: editingAlarm.label || "",
        task: editingAlarm.task || activeChallenge.title,
        challengeId: editingAlarm.challengeId || activeChallenge.id,
        customTask:
          editingAlarm.challengeId === "custom" ? editingAlarm.task || "" : "",
        targets: Array.isArray(editingAlarm.targets)
          ? editingAlarm.targets
          : activeChallenge.targets || [],
        difficulty: editingAlarm.difficulty || activeChallenge.difficulty,
        antiCheatStrictness: editingAlarm.antiCheatStrictness || "Strict",
        ringtone: editingAlarm.ringtone || RINGTONE_OPTIONS[0].value,
        snoozeMinutes: editingAlarm.snoozeMinutes ?? 5,
        repeatDays: editingAlarm.repeatDays?.length
          ? editingAlarm.repeatDays
          : [...DAYS],
        isActive: editingAlarm.isActive ?? true,
      });
    } else {
      setForm(getDefaultForm());
    }
  }, [editingAlarm, visible]);

  useEffect(() => {
    if (visible) return;
    stopAlarmSound();
    isPreviewingRef.current = false;
  }, [visible]);

  useEffect(() => () => stopAlarmSound(), []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleDay = (day) => {
    Haptics.selectionAsync();
    setForm((p) => ({
      ...p,
      repeatDays: p.repeatDays.includes(day)
        ? p.repeatDays.filter((d) => d !== day)
        : [...p.repeatDays, day],
    }));
  };

  const selectChallenge = (c) => {
    Haptics.selectionAsync();
    setForm((p) => ({
      ...p,
      task: c.title,
      challengeId: c.id,
      difficulty: c.difficulty,
      targets: c.targets || [],
      customTask: c.id === "custom" ? p.customTask : "",
    }));
  };

  const handleSave = () => {
    // Validation
    if (!form.repeatDays.length) {
      return Alert.alert(
        "Schedule Error",
        "Please select at least one repeat day.",
      );
    }

    if (form.challengeId === "custom" && form.customTask.length > 120) {
      return Alert.alert(
        "Challenge Error",
        "Prompt is too long. Keep it under 120 characters.",
      );
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const finalTask =
      form.challengeId === "custom" ? form.customTask.trim() : form.task;
    const finalTargets =
      form.challengeId === "custom"
        ? extractTargets(form.customTask)
        : form.targets;

    stopAlarmSound();
    isPreviewingRef.current = false;

    onSave({
      id: editingAlarm?.id,
      time: `${form.hour}:${form.minute}`,
      period: form.period,
      label: form.label.trim() || "Alarm",
      task: finalTask,
      challengeId: form.challengeId,
      targets: finalTargets,
      difficulty: form.difficulty,
      antiCheatStrictness: form.antiCheatStrictness,
      ringtone: form.ringtone,
      snoozeMinutes: Number(form.snoozeMinutes) || 5,
      repeatDays: form.repeatDays,
      isActive: form.isActive,
    });
  };

  const adjustSnooze = (delta) => {
    const next = Math.max(1, Math.min(30, (form.snoozeMinutes || 5) + delta));
    Haptics.selectionAsync();
    set("snoozeMinutes", next);
  };

  const handleClose = () => {
    stopAlarmSound();
    isPreviewingRef.current = false;
    onClose();
  };

  const previewRingtone = async (value) => {
    await stopAlarmSound();
    if (!value || value === "Silent") {
      isPreviewingRef.current = false;
      return;
    }
    await startAlarmSound(value);
    isPreviewingRef.current = true;
  };

  const handleBackgroundTouch = () => {
    if (!isPreviewingRef.current || suppressStopRef.current) return;
    stopAlarmSound();
    isPreviewingRef.current = false;
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.overlay}
      >
        <View style={s.sheet}>
          <View style={s.dragBar} />

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={handleClose} style={s.closeBtn}>
              <Ionicons name="close" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={s.titleWrap}>
              <Text style={s.title}>
                {editingAlarm ? "Edit Alarm" : "New Alarm"}
              </Text>
              <Text style={s.subtitle}>AI-verified wake-up</Text>
            </View>
            <TouchableOpacity onPress={handleSave} style={s.saveBtn}>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={s.saveTxt}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scrollContent}
            onTouchStart={handleBackgroundTouch}
          >
            {/* Time Picker */}
            <Animated.View
              entering={FadeInDown.duration(500)}
              style={s.timeCard}
            >
              <Text style={s.timeLabel}>SET TIME</Text>
              <WheelTimePicker
                hour={form.hour}
                minute={form.minute}
                period={form.period}
                onChangeHour={(v) => set("hour", v)}
                onChangeMinute={(v) => set("minute", v)}
                onChangePeriod={(v) => set("period", v)}
              />
              <View style={s.timePreview}>
                <Ionicons
                  name="alarm-outline"
                  size={16}
                  color={colors.primary}
                />
                <Text style={s.timePreviewTxt}>
                  {form.hour}:{form.minute} {form.period}
                </Text>
              </View>
            </Animated.View>

            {/* Schedule */}
            <Section title="Schedule" icon="calendar-outline" delay={100}>
              <View style={s.dayRow}>
                {DAYS.map((day) => {
                  const active = form.repeatDays.includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[s.dayChip, active && s.dayChipOn]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text style={[s.dayChipTxt, active && s.dayChipTxtOn]}>
                        {day.charAt(0)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={s.labelRow}>
                <Ionicons name="pricetag-outline" size={16} color="#999" />
                <TextInput
                  style={s.labelInput}
                  value={form.label}
                  onChangeText={(v) => set("label", v)}
                  placeholder="Alarm label (optional)"
                  placeholderTextColor="#bbb"
                />
              </View>
            </Section>

            {/* Wake-up Challenge */}
            <Section
              title="Wake-up Challenge"
              icon="rocket-outline"
              delay={200}
            >
              <View style={s.challengeGrid}>
                {ALL_CHALLENGES.map((c) => {
                  const on = form.challengeId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[s.cBox, on && s.cBoxOn]}
                      onPress={() => selectChallenge(c)}
                      activeOpacity={0.7}
                    >
                      <View style={[s.cIconWrap, on && s.cIconWrapOn]}>
                        <Ionicons
                          name={c.icon}
                          size={20}
                          color={on ? "#fff" : colors.primary}
                        />
                      </View>
                      <Text
                        numberOfLines={1}
                        style={[s.cTitle, on && s.cTitleOn]}
                      >
                        {c.title}
                      </Text>
                      <View style={s.cBadgeRow}>
                        <Text style={[s.cBadge, on && s.cBadgeOn]}>
                          {c.verificationTips.split(" ")[0]}
                        </Text>
                        <Text style={[s.cMeta, on && s.cMetaOn]}>
                          {c.difficulty}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {form.challengeId === "custom" && (
                <View style={s.customInputBox}>
                  <Text style={s.customLabel}>Challenge Description</Text>
                  <TextInput
                    style={s.customInput}
                    placeholder="e.g. Show my blue water bottle"
                    placeholderTextColor="#bbb"
                    value={form.customTask}
                    onChangeText={(v) => set("customTask", v)}
                    multiline
                    maxLength={120}
                    autoCapitalize="sentences"
                  />
                  <Text style={s.customTip}>
                    {form.customTask.length}/120 - AI will verify your
                    description.
                  </Text>
                </View>
              )}

              <Text style={s.optLabel}>Task Difficulty</Text>
              <View style={s.segRow}>
                {DIFFICULTY_LEVELS.map((lv) => (
                  <TouchableOpacity
                    key={lv}
                    style={[s.seg, form.difficulty === lv && s.segOn]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      set("difficulty", lv);
                    }}
                  >
                    <Text
                      style={[s.segTxt, form.difficulty === lv && s.segTxtOn]}
                    >
                      {lv}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.optLabel}>Anti-cheat Strictness</Text>
              <View style={s.segRow}>
                {STRICTNESS_LEVELS.map((lv) => {
                  const on = form.antiCheatStrictness === lv;
                  const color =
                    lv === "Standard"
                      ? "#4CAF50"
                      : lv === "Strict"
                        ? "#FF9800"
                        : "#E23744";
                  return (
                    <TouchableOpacity
                      key={lv}
                      style={[
                        s.seg,
                        on && { backgroundColor: color, borderColor: color },
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        set("antiCheatStrictness", lv);
                      }}
                    >
                      <Text style={[s.segTxt, on && s.segTxtOn]}>{lv}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={s.strictnessDesc}>
                {form.antiCheatStrictness === "Standard" &&
                  "Faster verification, fewer restrictions."}
                {form.antiCheatStrictness === "Strict" &&
                  "Balanced protection against simple cheats."}
                {form.antiCheatStrictness === "Lockdown" &&
                  "Maximum enforcement. Strictly live frames only."}
              </Text>

              <View style={s.aiBox}>
                <Ionicons name="sparkles" size={18} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={s.aiBoxTitle}>AI Verification</Text>
                  <Text style={s.aiBoxTxt}>
                    {form.challengeId === "custom"
                      ? "AI will perform semantic scene analysis on your custom prompt."
                      : `AI will verify this challenge using live camera analysis. ${getChallengeById(form.challengeId).verificationTips}`}
                  </Text>
                  <View style={s.targetPreview}>
                    <Text style={s.targetPreviewLabel}>AI will look for:</Text>
                    <View style={s.targetList}>
                      {(form.challengeId === "custom"
                        ? extractTargets(form.customTask)
                        : form.targets
                      ).map((t, idx) => (
                        <Text key={idx} style={s.targetTag}>
                          - {t}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </Section>

            {/* Sound & System */}
            <Section title="Sound & System" icon="settings-outline" delay={300}>
              {/* Ringtone */}
              <Text style={s.optLabel}>Ringtone</Text>
              <View style={s.ringRow}>
                {RINGTONE_OPTIONS.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={[
                      s.ringChip,
                      form.ringtone === r.value && s.ringChipOn,
                    ]}
                    onPressIn={() => {
                      suppressStopRef.current = true;
                    }}
                    onPressOut={() => {
                      suppressStopRef.current = false;
                    }}
                    onPress={async () => {
                      Haptics.selectionAsync();
                      set("ringtone", r.value);
                      await previewRingtone(r.value);
                    }}
                  >
                    <Ionicons
                      name={
                        form.ringtone === r.value
                          ? "musical-note"
                          : "musical-note-outline"
                      }
                      size={14}
                      color={form.ringtone === r.value ? "#fff" : "#999"}
                    />
                    <Text
                      style={[
                        s.ringTxt,
                        form.ringtone === r.value && s.ringTxtOn,
                      ]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Snooze Stepper */}
              <View style={s.snoozeRow}>
                <View style={s.snoozeInfo}>
                  <View style={s.selectorIconShell}>
                    <Ionicons
                      name="timer-outline"
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={s.snoozeLabel}>Snooze</Text>
                </View>
                <View style={s.stepper}>
                  <TouchableOpacity
                    style={s.stepBtn}
                    onPress={() => adjustSnooze(-1)}
                  >
                    <Ionicons name="remove" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={s.stepVal}>{form.snoozeMinutes}m</Text>
                  <TouchableOpacity
                    style={s.stepBtn}
                    onPress={() => adjustSnooze(1)}
                  >
                    <Ionicons name="add" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <ToggleItem
                label="Alarm enabled"
                value={form.isActive}
                onChange={(v) => set("isActive", v)}
                icon="notifications-outline"
              />
            </Section>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const ToggleItem = ({ label, value, onChange, icon }) => (
  <View style={s.toggleRow}>
    <View style={s.toggleLeft}>
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color="#999"
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={s.toggleTxt}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: "#E8E8E8", true: colors.primary }}
      thumbColor="#fff"
      ios_backgroundColor="#E8E8E8"
    />
  </View>
);

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#F5F5F7",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: "92%",
  },
  dragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D0D0D0",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  titleWrap: { alignItems: "center" },
  title: {
    fontSize: 18,
    fontFamily: typography.family.extraBold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: typography.family.bold,
    color: "#999",
    marginTop: 1,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  saveTxt: { color: "#fff", fontFamily: typography.family.bold, fontSize: 14 },
  scrollContent: { padding: 16, paddingBottom: 50 },

  // Time Card
  timeCard: {
    backgroundColor: "#1C1C1C",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  timeLabel: {
    textAlign: "center",
    fontFamily: typography.family.bold,
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 2,
    marginBottom: 12,
  },
  timePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
    backgroundColor: "rgba(226,55,68,0.12)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "center",
  },
  timePreviewTxt: {
    fontFamily: typography.family.extraBold,
    fontSize: 16,
    color: colors.primary,
  },

  // Section
  section: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: typography.family.extraBold,
    color: "#888",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  // Days
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  dayChipOn: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  dayChipTxt: {
    fontFamily: typography.family.bold,
    fontSize: 14,
    color: "#BBB",
  },
  dayChipTxtOn: { color: "#fff" },

  // Label
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8F8F8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  labelInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: typography.family.bold,
    color: colors.text.primary,
    padding: 0,
  },

  // Challenges
  challengeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  cBox: {
    width: "48%",
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    minHeight: 100,
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  cBoxOn: {
    backgroundColor: "#1C1C1C",
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  cIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cIconWrapOn: { backgroundColor: colors.primary },
  cTitle: {
    fontSize: 12,
    fontFamily: typography.family.bold,
    color: "#444",
    textAlign: "center",
    marginBottom: 4,
  },
  cTitleOn: { color: "#fff" },
  cBadgeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cBadge: {
    fontSize: 9,
    fontFamily: typography.family.extraBold,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    overflow: "hidden",
  },
  cBadgeOn: { color: "#fff", backgroundColor: "rgba(255,255,255,0.2)" },
  cMeta: {
    fontSize: 10,
    fontFamily: typography.family.bold,
    color: "#AAA",
    textAlign: "center",
  },
  cMetaOn: { color: "rgba(255,255,255,0.6)" },

  // Segments
  optLabel: {
    fontFamily: typography.family.bold,
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  segRow: { flexDirection: "row", gap: 8 },
  seg: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  segOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  segTxt: { fontFamily: typography.family.bold, fontSize: 12, color: "#999" },
  segTxtOn: { color: "#fff" },

  // Toggles
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  toggleLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  toggleTxt: {
    fontFamily: typography.family.bold,
    fontSize: 14,
    color: colors.text.primary,
  },

  // AI Info
  aiBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F7DADB",
  },
  aiBoxTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 13,
    color: colors.text.primary,
    marginBottom: 2,
  },
  aiBoxTxt: {
    fontFamily: typography.family.bold,
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
    marginBottom: 8,
  },
  targetPreview: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 8,
  },
  targetPreviewLabel: {
    fontSize: 10,
    fontFamily: typography.family.extraBold,
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  targetList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  targetTag: {
    fontSize: 11,
    fontFamily: typography.family.bold,
    color: colors.primary,
  },

  // Custom Challenge
  customInputBox: {
    marginTop: 12,
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  customLabel: {
    fontSize: 11,
    fontFamily: typography.family.bold,
    color: "#999",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  customInput: {
    fontSize: 15,
    fontFamily: typography.family.bold,
    color: colors.text.primary,
    minHeight: 60,
    textAlignVertical: "top",
    padding: 0,
    marginBottom: 4,
  },
  customTip: {
    fontSize: 10,
    fontFamily: typography.family.bold,
    color: "#BBB",
    marginTop: 4,
  },

  // Strictness
  strictnessDesc: {
    fontSize: 11,
    fontFamily: typography.family.bold,
    color: "#888",
    marginTop: 8,
    marginLeft: 4,
  },

  // Ringtones
  ringRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  ringChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  ringChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  ringTxt: { fontFamily: typography.family.bold, fontSize: 11, color: "#888" },
  ringTxtOn: { color: "#fff" },
  nativeSoundBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#F7DADB",
  },
  nativeSoundText: {
    flex: 1,
    fontFamily: typography.family.bold,
    fontSize: 11,
    lineHeight: 16,
    color: colors.text.primary,
  },

  // Snooze
  snoozeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  snoozeInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  selectorIconShell: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  snoozeLabel: {
    fontFamily: typography.family.bold,
    fontSize: 14,
    color: colors.text.primary,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    overflow: "hidden",
  },
  stepBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  stepVal: {
    fontFamily: typography.family.extraBold,
    fontSize: 14,
    color: colors.text.primary,
    minWidth: 36,
    textAlign: "center",
  },

  // Permission
  permBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    padding: 14,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  permLabel: {
    fontFamily: typography.family.bold,
    fontSize: 13,
    color: colors.text.primary,
  },
  permStatus: {
    fontSize: 11,
    fontFamily: typography.family.bold,
    color: "#FF9800",
    marginTop: 1,
  },
  permBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  permBtnTxt: {
    fontFamily: typography.family.bold,
    fontSize: 12,
    color: "#fff",
  },
});

export default AlarmSettingsModal;
