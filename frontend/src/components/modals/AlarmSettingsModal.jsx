import { useAtom, useAtomValue } from "jotai";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  alarmDraftAtom,
  alarmEditingIdAtom,
  alarmModalVisibleAtom,
  alarmsAtom,
} from "../../atoms/alarmAtoms";
import { PrimaryButton } from "../PrimaryButton";
import { handleSaveAlarmAction } from "../../services/alarmActions";
import { stopAlarmSound } from "../../services/soundService";
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

  const isEdit = Boolean(editingId);

  const update = (key, val) => {
    setDraft((prev) => ({ ...prev, [key]: val }));
  };

  const updateMultiple = (values) => {
    setDraft((prev) => ({ ...prev, ...values }));
  };

  const close = async () => {
    await stopAlarmSound();
    setVisible(false);
  };

  const save = async () => {
    await stopAlarmSound();
    await handleSaveAlarmAction(alarms, draft, setAlarms);
    setVisible(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={close}
    >
      <View style={s.overlay}>
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={isDark ? 34 : 46}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <LinearGradient
            colors={
              isDark
                ? ["rgba(2,6,23,0.82)", "rgba(2,6,23,0.96)"]
                : ["rgba(15,23,42,0.18)", "rgba(15,23,42,0.38)"]
            }
            style={StyleSheet.absoluteFillObject}
          />
        )}

        <View style={[s.sheet, { backgroundColor: theme.bg }]}>
          <View style={s.handleWrap}>
            <View
              style={[
                s.handle,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(15,23,42,0.18)",
                },
              ]}
            />
          </View>

          <View style={s.topBar}>
            <TouchableOpacity
              onPress={close}
              hitSlop={12}
              style={[
                s.iconBtn,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <Ionicons name="close" size={21} color={theme.textPrimary} />
            </TouchableOpacity>

            <View style={s.titleBlock}>
              <Text style={[s.kicker, { color: theme.primary }]}>
                WAKE MISSION
              </Text>
              <Text style={[s.barTitle, { color: theme.textPrimary }]}>
                {isEdit ? "Edit Alarm" : "New Alarm"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={save}
              hitSlop={12}
              style={[
                s.iconBtn,
                {
                  backgroundColor: "rgba(255,122,24,0.14)",
                  borderColor: "rgba(255,122,24,0.22)",
                },
              ]}
            >
              <Ionicons name="checkmark" size={22} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scroll}
          >
            <LinearGradient
              colors={["#FF8A1C", "#FF5E1A", "#111827"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.timeHero}
            >
              <View style={s.heroBlobOne} />
              <View style={s.heroBlobTwo} />

              <View style={s.heroTop}>
                <View>
                  <Text style={s.heroTiny}>
                    {isEdit ? "ADJUST TIME" : "CHOOSE TIME"}
                  </Text>
                  <Text style={s.heroTitle}>
                    {isEdit ? "Fine tune your wake-up" : "Build your mission"}
                  </Text>
                </View>

                <View style={s.heroIcon}>
                  <Ionicons name="alarm" size={23} color="#FFF" />
                </View>
              </View>

              <View style={s.wheelBlock}>
                <TimeSection form={draft} setMultiple={updateMultiple} />
              </View>
            </LinearGradient>

            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>
                Mission Setup
              </Text>
              <Text style={[s.sectionSub, { color: theme.textSecondary }]}>
                Repeat, challenge, strictness, and system controls.
              </Text>
            </View>

            <View
              style={[
                s.settingsCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
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

            <View style={s.bottomSpacer} />
          </ScrollView>

          <View
            style={[
              s.footer,
              {
                backgroundColor: theme.bg,
                borderTopColor: theme.divider,
              },
            ]}
          >
            <PrimaryButton
              label={isEdit ? "Save Changes" : "Save Alarm"}
              icon="chevron-forward"
              iconPosition="right"
              onPress={save}
              hapticOnPress="impact"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  sheet: {
    height: "94%",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    overflow: "hidden",
  },

  handleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 2,
  },

  handle: {
    width: 42,
    height: 5,
    borderRadius: 99,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },

  titleBlock: {
    alignItems: "center",
  },

  kicker: {
    ...typography.styles.caption,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 3,
  },

  barTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.7,
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },

  timeHero: {
    minHeight: 270,
    borderRadius: 36,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 14,
    overflow: "hidden",

    shadowColor: "#FF7A18",
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },

  heroBlobOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.13)",
    right: -66,
    top: -72,
  },

  heroBlobTwo: {
    position: "absolute",
    width: 135,
    height: 135,
    borderRadius: 67.5,
    backgroundColor: "rgba(255,255,255,0.08)",
    left: -48,
    bottom: -42,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  heroTiny: {
    ...typography.styles.caption,
    color: "rgba(255,255,255,0.76)",
    fontWeight: "900",
    letterSpacing: 1,
  },

  heroTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 25,
    lineHeight: 30,
    letterSpacing: -1,
    color: "#FFF",
    marginTop: 4,
    maxWidth: 230,
  },

  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  wheelBlock: {
    marginTop: 4,
  },

  sectionHeader: {
    marginTop: 28,
    marginBottom: 14,
  },

  sectionTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 24,
    lineHeight: 29,
    letterSpacing: -0.9,
  },

  sectionSub: {
    ...typography.styles.caption,
    marginTop: 5,
    lineHeight: 18,
  },

  settingsCard: {
    borderRadius: 30,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    overflow: "hidden",
  },

  innerRule: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
    marginHorizontal: 8,
  },

  bottomSpacer: {
    height: 180,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});