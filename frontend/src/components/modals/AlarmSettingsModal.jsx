import { useAtom, useAtomValue } from "jotai";
import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform } from "react-native";
import {
  alarmDraftAtom,
  alarmEditingIdAtom,
  alarmModalVisibleAtom,
  alarmsAtom,
} from "../../atoms/alarmAtoms";
import { PrimaryButton } from "../PrimaryButton";
import { handleSaveAlarmAction } from "../../services/alarmActions";
import { useTheme } from "../../theme/ThemeContext";
import { typography, tokens } from "../../theme";
import { TimeSection } from "./settings/TimeSection";
import { ScheduleSection } from "./settings/ScheduleSection";
import { ChallengeSection } from "./settings/ChallengeSection";
import { StrictnessSection } from "./settings/StrictnessSection";
import { SystemSection } from "./settings/SystemSection";

export default function AlarmSettingsModal() {
  const { theme, isDark } = useTheme();
  const [visible, setVisible] = useAtom(alarmModalVisibleAtom);
  const [draft, setDraft] = useAtom(alarmDraftAtom);
  const editingId = useAtomValue(alarmEditingIdAtom);
  const [alarms, setAlarms] = useAtom(alarmsAtom);

  const update = (key, val) => setDraft((p) => ({ ...p, [key]: val }));
  const updateMultiple = (values) => setDraft((p) => ({ ...p, ...values }));

  const close = () => setVisible(false);

  const save = async () => {
    await handleSaveAlarmAction(alarms, draft, setAlarms);
    setVisible(false);
  };

  const isEdit = Boolean(editingId);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <View style={[s.overlay, { backgroundColor: isDark ? "rgba(0, 0, 0, 0.88)" : "rgba(26, 26, 26, 0.35)" }]}>
        <View style={[s.sheet, { backgroundColor: theme.bg }]}>
          {/* App-bar style header */}
          <View style={s.topBar}>
            <TouchableOpacity onPress={close} style={[s.iconBtn, { backgroundColor: theme.surface }]} hitSlop={12}>
              <Ionicons name="chevron-back" size={22} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={[s.barTitle, { color: theme.textPrimary }]}>{isEdit ? "Edit alarm" : "Add alarm"}</Text>
            <TouchableOpacity onPress={save} style={[s.iconBtn, { backgroundColor: `${theme.primary}22` }]} hitSlop={12}>
              <Ionicons name="checkmark" size={22} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
            <View style={s.wheelBlock}>
              <TimeSection form={draft} setMultiple={updateMultiple} />
            </View>

            <View
              style={[
                s.settingsCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                  ...Platform.select({
                    ios: tokens.shadows.sm,
                    android: { elevation: 3 },
                  }),
                },
              ]}
            >
              <ScheduleSection form={draft} set={update} theme={theme} />
              <View style={[s.innerRule, { backgroundColor: theme.divider }]} />
              <ChallengeSection form={draft} set={update} theme={theme} />
              <View style={[s.innerRule, { backgroundColor: theme.divider }]} />
              <StrictnessSection form={draft} set={update} theme={theme} />
              <View style={[s.innerRule, { backgroundColor: theme.divider }]} />
              <SystemSection form={draft} set={update} theme={theme} />
            </View>

            <View style={{ height: 180 }} />
          </ScrollView>

          <View style={[s.footer, { backgroundColor: theme.bg, borderTopColor: theme.divider }]}>
            <PrimaryButton label="Save alarm" icon="chevron-forward" iconPosition="right" onPress={save} hapticOnPress="impact" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    height: "94%",
    borderTopLeftRadius: tokens.radius.giant,
    borderTopRightRadius: tokens.radius.giant,
    overflow: "hidden",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  barTitle: {
    fontFamily: typography.family.section,
    fontSize: tokens.typography.size.card,
    letterSpacing: -0.3,
  },
  scroll: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.sm,
  },
  wheelBlock: {
    marginBottom: tokens.spacing.xl,
  },
  settingsCard: {
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.sm,
    overflow: "hidden",
  },
  innerRule: {
    height: StyleSheet.hairlineWidth,
    marginVertical: tokens.spacing.sm,
    marginHorizontal: tokens.spacing.sm,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xxl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
