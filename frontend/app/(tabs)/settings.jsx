import { Ionicons } from "@expo/vector-icons";
import { useAtom } from "jotai";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { preferencesAtom } from "../../src/atoms/alarmAtoms";
import { GlassCard } from "../../src/components/GlassCard";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { tokens, typography } from "../../src/theme";
import { useTheme } from "../../src/theme/ThemeContext";
import { haptics } from "../../src/services/hapticService";

export default function SettingsScreen() {
  const { theme, isDark, toggleDark } = useTheme();
  const [prefs, setPrefs] = useAtom(preferencesAtom);

  const togglePref = (key) => {
    haptics.selection();
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleDark = () => {
    haptics.selection();
    toggleDark();
  };

  const trackOn = theme.primary;
  const trackOff = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)";

  return (
    <View style={[s.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={s.safeArea} edges={["top"]}>
        <Animated.View entering={FadeIn.duration(tokens.animation.duration.normal)} style={s.header}>
          <Text style={[s.metadata, { color: theme.textMuted }]}>PREFERENCES & ACCOUNT</Text>
          <Text style={[s.pageTitle, { color: theme.textPrimary }]}>Settings</Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          <Animated.View entering={FadeInDown.delay(100).duration(tokens.animation.duration.normal)}>
            <GlassCard style={[s.profileHero, { borderColor: theme.cardBorder }]} containerStyle={s.profileInner}>
              <View style={[s.avatar, { backgroundColor: `${theme.primary}33` }]}>
                <Ionicons name="person" size={24} color={theme.primary} />
              </View>
              <View style={s.userInfo}>
                <Text style={[s.userName, { color: theme.textPrimary }]}>Alex Vishwakarma</Text>
                <Text style={[s.userMeta, { color: theme.textSecondary }]}>Level 12 • Early Bird Streak</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(tokens.animation.duration.normal)} style={s.group}>
            <Text style={[s.groupLabel, { color: theme.textMuted }]}>EXPERIENCE</Text>
            <View style={[s.groupCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <SettingRow
                label="AI verification"
                icon="scan"
                theme={theme}
                right={
                  <Switch
                    value={prefs.aiVerificationEnabled}
                    onValueChange={() => togglePref("aiVerificationEnabled")}
                    trackColor={{ false: trackOff, true: trackOn }}
                    thumbColor="#FFF"
                    style={s.miniSwitch}
                  />
                }
              />
              <View style={[s.divider, { backgroundColor: theme.divider }]} />
              <SettingRow
                label="Haptic feedback"
                icon="phone-portrait"
                theme={theme}
                right={
                  <Switch
                    value={prefs.hapticsEnabled}
                    onValueChange={() => togglePref("hapticsEnabled")}
                    trackColor={{ false: trackOff, true: trackOn }}
                    thumbColor="#FFF"
                    style={s.miniSwitch}
                  />
                }
              />
              <View style={[s.divider, { backgroundColor: theme.divider }]} />
              <SettingRow
                label="Smart wake suggestions"
                icon="bulb"
                theme={theme}
                right={
                  <Switch
                    value={prefs.smartWakeEnabled}
                    onValueChange={() => togglePref("smartWakeEnabled")}
                    trackColor={{ false: trackOff, true: trackOn }}
                    thumbColor="#FFF"
                    style={s.miniSwitch}
                  />
                }
              />
              <View style={[s.divider, { backgroundColor: theme.divider }]} />
              <SettingRow
                label="Vibration"
                icon="volume-high"
                theme={theme}
                right={
                  <Switch
                    value={prefs.vibrationEnabled}
                    onValueChange={() => togglePref("vibrationEnabled")}
                    trackColor={{ false: trackOff, true: trackOn }}
                    thumbColor="#FFF"
                    style={s.miniSwitch}
                  />
                }
              />
              <View style={[s.divider, { backgroundColor: theme.divider }]} />
              <SettingRow
                label="Auto-open camera"
                icon="camera"
                theme={theme}
                right={
                  <Switch
                    value={prefs.autoLaunchCamera}
                    onValueChange={() => togglePref("autoLaunchCamera")}
                    trackColor={{ false: trackOff, true: trackOn }}
                    thumbColor="#FFF"
                    style={s.miniSwitch}
                  />
                }
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(tokens.animation.duration.normal)} style={s.group}>
            <Text style={[s.groupLabel, { color: theme.textMuted }]}>SYSTEM & DISPLAY</Text>
            <View style={[s.groupCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <TouchableOpacity style={s.row} onPress={handleToggleDark}>
                <View style={s.rowLeft}>
                  <View style={[s.iconBox, { backgroundColor: theme.card }]}>
                    <Ionicons name="moon" size={16} color={theme.textSecondary} />
                  </View>
                  <Text style={[s.rowLabel, { color: theme.textPrimary }]}>Appearance</Text>
                </View>
                <View style={s.rowRight}>
                  <Text style={[s.rowVal, { color: theme.primary }]}>{isDark ? "Dark" : "Light"}</Text>
                  <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
                </View>
              </TouchableOpacity>
              <View style={[s.divider, { backgroundColor: theme.divider }]} />
              <TouchableOpacity style={s.row} onPress={() => haptics.selection()}>
                <View style={s.rowLeft}>
                  <View style={[s.iconBox, { backgroundColor: theme.card }]}>
                    <Ionicons name="notifications" size={16} color={theme.textSecondary} />
                  </View>
                  <Text style={[s.rowLabel, { color: theme.textPrimary }]}>Notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(tokens.animation.duration.normal)}>
            <PrimaryButton
              label="SnapWake Pro"
              variant="primary"
              icon="star"
              iconPosition="left"
              onPress={() => haptics.impact("medium")}
              style={s.proBtn}
              hapticOnPress="impact"
            />
            <Text style={[s.proHint, { color: theme.textMuted }]}>
              Unlock premium sounds and advanced AI verification.
            </Text>
          </Animated.View>

          <View style={{ height: 140 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const SettingRow = ({ label, icon, theme, right }) => (
  <View style={s.row}>
    <View style={s.rowLeft}>
      <View style={[s.iconBox, { backgroundColor: theme.card }]}>
        <Ionicons name={icon} size={16} color={theme.textSecondary} />
      </View>
      <Text style={[s.rowLabel, { color: theme.textPrimary }]}>{label}</Text>
    </View>
    <View>{right}</View>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: tokens.spacing.xl, paddingTop: tokens.spacing.xl, paddingBottom: tokens.spacing.md },
  metadata: {
    fontFamily: typography.family.metadata,
    fontSize: tokens.typography.size.tiny,
    letterSpacing: 2,
    marginBottom: 4,
    opacity: 0.6,
  },
  pageTitle: {
    fontFamily: typography.family.section,
    fontSize: tokens.typography.size.section,
    letterSpacing: -0.8,
  },
  content: { padding: tokens.spacing.xl, gap: tokens.spacing.giant },
  profileHero: {
    borderWidth: 1,
  },
  profileInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: tokens.spacing.lg,
  },
  userInfo: { flex: 1, marginLeft: tokens.spacing.lg },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  userName: { fontFamily: typography.family.card, fontSize: tokens.typography.size.card, letterSpacing: -0.5 },
  userMeta: { fontFamily: typography.family.metadata, fontSize: tokens.typography.size.caption, marginTop: 1, opacity: 0.7 },
  group: { gap: tokens.spacing.lg },
  groupLabel: {
    fontFamily: typography.family.metadata,
    fontSize: tokens.typography.size.tiny,
    letterSpacing: 1.5,
    paddingHorizontal: 4,
    opacity: 0.5,
  },
  groupCard: {
    borderRadius: tokens.radius.xl,
    overflow: "hidden",
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: tokens.spacing.md },
  rowRight: { flexDirection: "row", alignItems: "center", gap: tokens.spacing.sm },
  iconBox: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontFamily: typography.family.metadata, fontSize: tokens.typography.size.body, opacity: 0.9 },
  rowVal: { fontFamily: typography.family.metadata, fontSize: tokens.typography.size.caption, opacity: 0.8 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: tokens.spacing.lg },
  miniSwitch: { transform: [{ scale: 0.82 }] },
  proBtn: { marginBottom: tokens.spacing.sm },
  proHint: {
    fontFamily: typography.family.metadata,
    fontSize: tokens.typography.size.caption,
    textAlign: "center",
    opacity: 0.75,
    paddingHorizontal: tokens.spacing.lg,
  },
});
