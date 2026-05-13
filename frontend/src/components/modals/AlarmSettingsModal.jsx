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
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { AI_CHALLENGES } from "../../data/challengeCatalog";
import { RINGTONE_OPTIONS } from "../../data/ringtones";
import { startAlarmSound, stopAlarmSound } from "../../services/soundService";
import { typography } from "../../theme";
import { useTheme } from "../../theme/ThemeContext";

import { TimeSection } from "./settings/TimeSection";
import { ScheduleSection } from "./settings/ScheduleSection";
import { ChallengeSection } from "./settings/ChallengeSection";
import { SystemSection } from "./settings/SystemSection";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ALL_CHALLENGES = [...AI_CHALLENGES, { id: "custom", title: "Custom" }];

const getDefaultForm = () => ({
  hour: "06", minute: "00", period: "AM", label: "",
  task: ALL_CHALLENGES[0].title, challengeId: ALL_CHALLENGES[0].id,
  customTask: "", targets: ALL_CHALLENGES[0].targets || [],
  difficulty: ALL_CHALLENGES[0].difficulty || "Focused",
  antiCheatStrictness: "Strict", ringtone: RINGTONE_OPTIONS[0].value,
  snoozeMinutes: 5, repeatDays: [...DAYS], isActive: true,
});

const AlarmSettingsModal = ({ visible, editingAlarm, onClose, onSave }) => {
  const { theme } = useTheme();
  const [form, setForm] = useState(getDefaultForm);
  const isPreviewingRef = useRef(false);

  useEffect(() => {
    if (!visible) return;
    if (editingAlarm) {
      const [h, m] = (editingAlarm.time || "06:00").split(":");
      setForm({ ...editingAlarm, hour: h, minute: m });
    } else {
      setForm(getDefaultForm());
    }
  }, [editingAlarm, visible]);

  useEffect(() => { if (!visible) stopAlarmSound(); }, [visible]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleDay = (day) => {
    Haptics.selectionAsync();
    set("repeatDays", form.repeatDays.includes(day) ? form.repeatDays.filter(d => d !== day) : [...form.repeatDays, day]);
  };

  const selectChallenge = (c) => {
    Haptics.selectionAsync();
    setForm(p => ({ ...p, task: c.title, challengeId: c.id, targets: c.targets || [] }));
  };

  const handleSave = () => {
    if (!form.repeatDays.length) return Alert.alert("Error", "Select at least one day.");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    onSave({
      ...form,
      time: `${form.hour}:${form.minute}`,
      task: form.challengeId === "custom" ? form.customTask.trim() : form.task,
      snoozeMinutes: Number(form.snoozeMinutes),
    });
    onClose();
  };

  const previewRingtone = async (v) => {
    await stopAlarmSound();
    if (v && v !== "Silent") await startAlarmSound(v);
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.overlay}>
        <View style={[s.sheet, { backgroundColor: theme.bg }]}>
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} style={[s.btn, { backgroundColor: theme.surface }]}>
              <Ionicons name="close" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={[s.title, { color: theme.textPrimary }]}>{editingAlarm ? "Edit Alarm" : "New Alarm"}</Text>
            <TouchableOpacity onPress={handleSave} style={[s.saveBtn, { backgroundColor: theme.primary }]}>
              <Text style={s.saveTxt}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
            <TimeSection form={form} set={set} theme={theme} />
            <ScheduleSection form={form} set={set} toggleDay={toggleDay} theme={theme} />
            <ChallengeSection form={form} set={set} selectChallenge={selectChallenge} theme={theme} />
            <SystemSection form={form} set={set} previewRingtone={previewRingtone} adjustSnooze={(d) => set("snoozeMinutes", Math.max(1, form.snoozeMinutes + d))} theme={theme} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "90%" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
  btn: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 16, fontFamily: typography.family.bold },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveTxt: { color: "#FFF", fontFamily: typography.family.bold },
  content: { padding: 16 },
});

export default AlarmSettingsModal;
