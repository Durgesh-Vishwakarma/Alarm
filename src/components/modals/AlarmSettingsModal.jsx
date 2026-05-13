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
    useWindowDimensions,
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
import { useTheme } from "../../theme/ThemeContext";
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

const Section = ({ title, icon, children, delay = 0, accentColor, theme }) => (
  <Animated.View
    entering={FadeInDown.delay(delay).duration(400).springify()}
    style={[s.section, theme && { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
  >
    <View style={[s.sectionAccent, { backgroundColor: accentColor || (theme?.primary ?? colors.primary) }]} />
    <View style={s.sectionHeader}>
      <View style={[s.sectionIconWrap, { backgroundColor: `${accentColor || (theme?.primary ?? colors.primary)}1A` }]}>
        <Ionicons name={icon} size={16} color={accentColor || (theme?.primary ?? colors.primary)} />
      </View>
      <Text style={[s.sectionTitle, theme && { color: theme.textSecondary }]}>{title}</Text>
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
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const challengeTileWidth = Math.floor((screenWidth - 68) / 2);
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
        <View style={[s.sheet, { backgroundColor: theme.bg }]}>
          <View style={[s.dragBar, { backgroundColor: theme.cardBorder }]} />

          {/* Header */}
          <View style={[s.header, { borderBottomColor: theme.cardBorder }]}>
            <TouchableOpacity onPress={handleClose} style={[s.closeBtn, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <Ionicons name="close" size={22} color={theme.textPrimary} />
            </TouchableOpacity>
            <View style={s.titleWrap}>
              <Text style={[s.title, { color: theme.textPrimary }]}>
                {editingAlarm ? "Edit Alarm" : "New Alarm"}
              </Text>
              <Text style={[s.subtitle, { color: theme.textMuted }]}>AI-verified wake-up</Text>
            </View>
            <TouchableOpacity onPress={handleSave} style={[s.saveBtn, { backgroundColor: theme.primary }]}>
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
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
              style={[s.timeCard, { backgroundColor: theme.heroCard }]}
            >
              <Text style={s.timeLabel}>SET TIME</Text>
              <View style={s.timePickerWrap}>
                <View style={s.timeGlow} pointerEvents="none" />
                <WheelTimePicker
                  hour={form.hour}
                  minute={form.minute}
                  period={form.period}
                  onChangeHour={(v) => set("hour", v)}
                  onChangeMinute={(v) => set("minute", v)}
                  onChangePeriod={(v) => set("period", v)}
                />
              </View>
              <View style={s.timePreview}>
                <Ionicons
                  name="alarm-outline"
                  size={16}
                  color={theme.primary}
                />
                <Text style={[s.timePreviewTxt, { color: theme.heroNeon }]}>
                  {form.hour}:{form.minute} {form.period}
                </Text>
              </View>
            </Animated.View>

            {/* Schedule */}
            <Section title="Schedule" icon="calendar-outline" delay={100} accentColor="#3B82F6" theme={theme}>
              <View style={s.dayRow}>
                {DAYS.map((day) => {
                  const active = form.repeatDays.includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[s.dayChip, { backgroundColor: theme.surface }, active && { backgroundColor: theme.primary }]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text style={[s.dayChipTxt, { color: theme.textMuted }, active && s.dayChipTxtOn]}>
                        {day.charAt(0)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={[s.labelRow, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <Ionicons name="pricetag-outline" size={16} color={theme.textMuted} />
                <TextInput
                  style={[s.labelInput, { color: theme.textPrimary }]}
                  value={form.label}
                  onChangeText={(v) => set("label", v)}
                  placeholder="Alarm label (optional)"
                  placeholderTextColor={theme.textMuted}
                />
              </View>
            </Section>

            {/* Wake-up Challenge */}
            <Section title="Wake-up Challenge" icon="rocket-outline" delay={200} accentColor={theme.primary} theme={theme}>
              <View style={s.challengeGrid}>
                {ALL_CHALLENGES.map((c) => {
                  const on = form.challengeId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        s.cBox,
                        { width: challengeTileWidth, backgroundColor: theme.surface, borderColor: theme.cardBorder },
                        on && { backgroundColor: theme.heroCard, borderColor: theme.primary },
                      ]}
                      onPress={() => selectChallenge(c)}
                      activeOpacity={0.7}
                    >
                      <View style={[s.cIconWrap, { backgroundColor: theme.primaryLight }, on && { backgroundColor: theme.primary }]}>
                        <Ionicons name={c.icon} size={20} color={on ? "#FFFFFF" : theme.primary} />
                      </View>
                      <Text numberOfLines={1} style={[s.cTitle, { color: theme.textPrimary }, on && s.cTitleOn]}>
                        {c.title}
                      </Text>
                      <View style={s.cBadgeRow}>
                        <Text style={[s.cBadge, { color: theme.primary, backgroundColor: theme.primaryLight }, on && s.cBadgeOn]}>
                          {c.verificationTips.split(" ")[0]}
                        </Text>
                        <Text style={[s.cMeta, { color: theme.textMuted }, on && s.cMetaOn]}>
                          {c.difficulty}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {form.challengeId === "custom" && (
                <View style={[s.customInputBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                  <Text style={[s.customLabel, { color: theme.textMuted }]}>Challenge Description</Text>
                  <TextInput
                    style={[s.customInput, { color: theme.textPrimary }]}
                    placeholder="e.g. Show my blue water bottle"
                    placeholderTextColor={theme.textMuted}
                    value={form.customTask}
                    onChangeText={(v) => set("customTask", v)}
                    multiline
                    maxLength={120}
                    autoCapitalize="sentences"
                  />
                  <Text style={[s.customTip, { color: theme.textMuted }]}>
                    {form.customTask.length}/120 - AI will verify your description.
                  </Text>
                </View>
              )}

              <Text style={[s.optLabel, { color: theme.textMuted }]}>Task Difficulty</Text>
              <View style={s.segRow}>
                {DIFFICULTY_LEVELS.map((lv) => (
                  <TouchableOpacity
                    key={lv}
                    style={[
                      s.seg,
                      { backgroundColor: theme.surface, borderColor: "transparent" },
                      form.difficulty === lv && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => { Haptics.selectionAsync(); set("difficulty", lv); }}
                  >
                    <Text style={[s.segTxt, { color: theme.textSecondary }, form.difficulty === lv && s.segTxtOn]}>
                      {lv}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.optLabel, { color: theme.textMuted }]}>Anti-cheat Strictness</Text>
              <View style={s.segRow}>
                {STRICTNESS_LEVELS.map((lv) => {
                  const on = form.antiCheatStrictness === lv;
                  const color = lv === "Standard" ? "#4CAF50" : lv === "Strict" ? "#FF9800" : theme.danger;
                  return (
                    <TouchableOpacity
                      key={lv}
                      style={[
                        s.seg,
                        { backgroundColor: theme.surface, borderColor: "transparent" },
                        on && { backgroundColor: color, borderColor: color },
                      ]}
                      onPress={() => { Haptics.selectionAsync(); set("antiCheatStrictness", lv); }}
                    >
                      <Text style={[s.segTxt, { color: theme.textSecondary }, on && s.segTxtOn]}>{lv}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={[s.strictnessDesc, { color: theme.textSecondary }]}>
                {form.antiCheatStrictness === "Standard" && "Faster verification, fewer restrictions."}
                {form.antiCheatStrictness === "Strict" && "Balanced protection against simple cheats."}
                {form.antiCheatStrictness === "Lockdown" && "Maximum enforcement. Strictly live frames only."}
              </Text>

              <View style={[s.aiBox, { backgroundColor: theme.primaryLight, borderColor: theme.primarySoft }]}>
                <Ionicons name="sparkles" size={18} color={theme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.aiBoxTitle, { color: theme.textPrimary }]}>AI Verification</Text>
                  <Text style={[s.aiBoxTxt, { color: theme.textSecondary }]}>
                    {form.challengeId === "custom"
                      ? "AI will perform semantic scene analysis on your custom prompt."
                      : `AI will verify this challenge using live camera analysis. ${getChallengeById(form.challengeId).verificationTips}`}
                  </Text>
                  <View style={[s.targetPreview, { borderTopColor: theme.primarySoft }]}>
                    <Text style={[s.targetPreviewLabel, { color: theme.textSecondary }]}>AI will look for:</Text>
                    <View style={s.targetList}>
                      {(form.challengeId === "custom"
                        ? extractTargets(form.customTask)
                        : form.targets
                      ).map((t, idx) => (
                        <Text key={idx} style={[s.targetTag, { color: theme.primary }]}>- {t}</Text>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </Section>

            {/* Sound & System */}
            <Section title="Sound & System" icon="settings-outline" delay={300} accentColor="#8B5CF6" theme={theme}>
              <Text style={[s.optLabel, { color: theme.textMuted }]}>Ringtone</Text>
              <View style={s.ringRow}>
                {RINGTONE_OPTIONS.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={[
                      s.ringChip,
                      { backgroundColor: theme.surface, borderColor: "transparent" },
                      form.ringtone === r.value && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPressIn={() => { suppressStopRef.current = true; }}
                    onPressOut={() => { suppressStopRef.current = false; }}
                    onPress={async () => {
                      Haptics.selectionAsync();
                      set("ringtone", r.value);
                      await previewRingtone(r.value);
                    }}
                  >
                    <Ionicons
                      name={form.ringtone === r.value ? "musical-note" : "musical-note-outline"}
                      size={14}
                      color={form.ringtone === r.value ? "#FFFFFF" : theme.textMuted}
                    />
                    <Text style={[s.ringTxt, { color: theme.textSecondary }, form.ringtone === r.value && s.ringTxtOn]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[s.snoozeRow, { borderBottomColor: theme.divider }]}>
                <View style={s.snoozeInfo}>
                  <View style={[s.selectorIconShell, { backgroundColor: theme.primaryLight }]}>
                    <Ionicons name="timer-outline" size={16} color={theme.primary} />
                  </View>
                  <Text style={[s.snoozeLabel, { color: theme.textPrimary }]}>Snooze</Text>
                </View>
                <View style={[s.stepper, { backgroundColor: theme.surface }]}>
                  <TouchableOpacity style={s.stepBtn} onPress={() => adjustSnooze(-1)}>
                    <Ionicons name="remove" size={18} color={theme.primary} />
                  </TouchableOpacity>
                  <Text style={[s.stepVal, { color: theme.textPrimary }]}>{form.snoozeMinutes}m</Text>
                  <TouchableOpacity style={s.stepBtn} onPress={() => adjustSnooze(1)}>
                    <Ionicons name="add" size={18} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <ToggleItem
                label="Alarm enabled"
                value={form.isActive}
                onChange={(v) => set("isActive", v)}
                icon="notifications-outline"
                theme={theme}
              />
            </Section>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const ToggleItem = ({ label, value, onChange, icon, theme }) => (
  <View style={[s.toggleRow, theme && { borderBottomColor: theme.divider }]}>
    <View style={s.toggleLeft}>
      {icon && (
        <Ionicons name={icon} size={16} color={theme?.textMuted ?? colors.text.muted} style={{ marginRight: 8 }} />
      )}
      <Text style={[s.toggleTxt, theme && { color: theme.textPrimary }]}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: theme?.cardBorder ?? "#E8E8E8", true: theme?.primary ?? colors.primary }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={theme?.cardBorder ?? "#E8E8E8"}
    />
  </View>
);

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10,16,13,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "92%",
  },
  dragBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
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
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  titleWrap: { alignItems: "center" },
  title: { fontSize: 17, fontFamily: typography.family.extraBold },
  subtitle: { fontSize: 11, fontFamily: typography.family.medium, marginTop: 1 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveTxt: { color: "#FFFFFF", fontFamily: typography.family.bold, fontSize: 14 },
  scrollContent: { padding: 16, paddingBottom: 50 },
  timeCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
  },
  timePickerWrap: { position: "relative", overflow: "hidden", borderRadius: 14 },
  timeGlow: {
    position: "absolute",
    top: "20%",
    left: "10%",
    right: "10%",
    height: "60%",
    borderRadius: 140,
    backgroundColor: "rgba(255,255,255,0.04)",
    opacity: 1,
  },
  timeLabel: {
    textAlign: "center",
    fontFamily: typography.family.bold,
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 2,
    marginBottom: 12,
  },
  timePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "center",
  },
  timePreviewTxt: { fontFamily: typography.family.extraBold, fontSize: 15 },
  section: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  sectionIconWrap: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  sectionTitle: {
    fontSize: 12,
    fontFamily: typography.family.extraBold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  dayRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  dayChip: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  dayChipOn: {},
  dayChipTxt: { fontFamily: typography.family.bold, fontSize: 13 },
  dayChipTxtOn: { color: "#FFFFFF" },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
  },
  labelInput: { flex: 1, fontSize: 15, fontFamily: typography.family.bold, padding: 0 },
  challengeGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 18, justifyContent: "space-between" },
  cBox: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    height: 116,
    justifyContent: "center",
    borderWidth: 1.5,
    marginBottom: 8,
  },
  cBoxOn: {},
  cIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  cIconWrapOn: {},
  cTitle: { fontSize: 12, fontFamily: typography.family.bold, textAlign: "center", marginBottom: 4 },
  cTitleOn: { color: "#FFFFFF" },
  cBadgeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cBadge: { fontSize: 9, fontFamily: typography.family.extraBold, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, overflow: "hidden" },
  cBadgeOn: { color: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.15)" },
  cMeta: { fontSize: 10, fontFamily: typography.family.bold, textAlign: "center" },
  cMetaOn: { color: "rgba(255,255,255,0.55)" },
  optLabel: {
    fontFamily: typography.family.bold,
    fontSize: 11,
    marginBottom: 8,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  segRow: { flexDirection: "row", gap: 8 },
  seg: { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 10, borderWidth: 1.5 },
  segOn: {},
  segTxt: { fontFamily: typography.family.bold, fontSize: 12 },
  segTxtOn: { color: "#FFFFFF" },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toggleLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  toggleTxt: { fontFamily: typography.family.bold, fontSize: 14 },
  aiBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
  },
  aiBoxTitle: { fontFamily: typography.family.extraBold, fontSize: 13, marginBottom: 2 },
  aiBoxTxt: { fontFamily: typography.family.medium, fontSize: 12, lineHeight: 17, marginBottom: 8 },
  targetPreview: { borderTopWidth: 1, paddingTop: 8 },
  targetPreviewLabel: {
    fontSize: 10,
    fontFamily: typography.family.extraBold,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  targetList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  targetTag: { fontSize: 11, fontFamily: typography.family.bold },
  customInputBox: { marginTop: 12, borderRadius: 12, padding: 14, borderWidth: 1 },
  customLabel: { fontSize: 11, fontFamily: typography.family.bold, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  customInput: { fontSize: 15, fontFamily: typography.family.bold, minHeight: 60, textAlignVertical: "top", padding: 0, marginBottom: 4 },
  customTip: { fontSize: 10, fontFamily: typography.family.bold, marginTop: 4 },
  strictnessDesc: { fontSize: 11, fontFamily: typography.family.medium, marginTop: 8, marginLeft: 2 },
  ringRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  ringChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  ringChipOn: {},
  ringTxt: { fontFamily: typography.family.bold, fontSize: 11 },
  ringTxtOn: { color: "#FFFFFF" },
  snoozeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  snoozeInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  selectorIconShell: { width: 32, height: 32, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  snoozeLabel: { fontFamily: typography.family.bold, fontSize: 14 },
  stepper: { flexDirection: "row", alignItems: "center", borderRadius: 10, overflow: "hidden" },
  stepBtn: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  stepVal: { fontFamily: typography.family.extraBold, fontSize: 14, minWidth: 36, textAlign: "center" },
  permBox: { flexDirection: "row", alignItems: "center", borderRadius: 12, marginTop: 14, padding: 14, borderWidth: 1 },
  permLabel: { fontFamily: typography.family.bold, fontSize: 13 },
  permStatus: { fontSize: 11, fontFamily: typography.family.bold, marginTop: 1 },
  permBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  permBtnTxt: { fontFamily: typography.family.bold, fontSize: 12, color: "#FFFFFF" },
});

export default AlarmSettingsModal;
