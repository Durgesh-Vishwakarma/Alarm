import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useAtom } from "jotai";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { preferencesAtom } from "../../src/atoms/alarmAtoms";
import { requestNotificationPermissions } from "../../src/services/notificationService";
import { spacing, typography } from "../../src/theme";
import { useTheme } from "../../src/theme/ThemeContext";
import { THEME_LIST } from "../../src/theme/themes";

export default function SettingsScreen() {
  const { theme, themeId, isDark, selectTheme, toggleDark } = useTheme();
  const [prefs, setPrefs] = useAtom(preferencesAtom);

  const togglePref = (key) => {
    Haptics.selectionAsync();
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      "Reset Onboarding?",
      "You will see the introductory flow next time you open the app.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => Alert.alert("Success", "Onboarding flag cleared."),
        },
      ],
    );
  };

  const handlePermissionCheck = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const status = await requestNotificationPermissions();
    Alert.alert("System Check", `Notification Status: ${status}`);
  };

  // ── Derived colours from active theme ──────────────────────
  const bg          = theme.bg;
  const card        = theme.card;
  const border      = theme.cardBorder;
  const surface     = theme.surface;
  const primary     = theme.primary;
  const primaryLight= theme.primaryLight;
  const textPrimary = theme.textPrimary;
  const textSec     = theme.textSecondary;
  const textMuted   = theme.textMuted;
  const heroCard    = theme.heroCard;
  const heroBorder  = theme.heroBorder;
  const danger      = theme.danger;

  return (
    <View style={[s.container, { backgroundColor: bg }]}>
      <StatusBar style={theme.statusBar} backgroundColor={bg} translucent={false} />
      <SafeAreaView style={s.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
        >
          {/* ── Page Header ── */}
          <Animated.View entering={FadeInDown.duration(350)} style={s.pageHeader}>
            <View>
              <Text style={[s.pageTitle, { color: textPrimary }]}>Settings</Text>
              <Text style={[s.pageSubtitle, { color: textMuted }]}>
                Appearance, AI controls & system
              </Text>
            </View>
            <View style={[s.securePill, { backgroundColor: primaryLight, borderColor: primary + "30" }]}>
              <Ionicons name="shield-checkmark" size={14} color={primary} />
              <Text style={[s.secureTxt, { color: primary }]}>Secure</Text>
            </View>
          </Animated.View>

          {/* ── Profile Card ── */}
          <Animated.View entering={FadeInDown.delay(50).duration(350)} style={[s.profileCard, { backgroundColor: card, borderColor: border }]}>
            <View style={[s.avatarShell, { backgroundColor: primaryLight }]}>
              <Text style={[s.avatarText, { color: primary }]}>DW</Text>
            </View>
            <View style={s.profileCopy}>
              <Text style={[s.profileName, { color: textPrimary }]}>Durgesh Wankhede</Text>
              <Text style={[s.profileMeta, { color: textMuted }]}>durgesh@snapwake.ai</Text>
            </View>
            <TouchableOpacity style={[s.profileAction, { borderColor: border }]}>
              <Ionicons name="create-outline" size={16} color={primary} />
            </TouchableOpacity>
          </Animated.View>

          {/* ── AI Verification Hero Card ── */}
          <Animated.View entering={FadeInDown.delay(100).duration(350)} style={[s.heroCard, { backgroundColor: heroCard, borderColor: heroBorder }]}>
            <View style={[s.heroIcon, { backgroundColor: primary }]}>
              <Ionicons name="scan" size={24} color="#FFFFFF" />
            </View>
            <View style={s.heroCopy}>
              <Text style={s.heroLabel}>AI Verification</Text>
              <Text style={s.heroValue}>{prefs.aiVerificationEnabled ? "Enabled" : "Disabled"}</Text>
              <Text style={s.heroSub}>
                {prefs.aiVerificationEnabled
                  ? "Gemini AI verifies all morning challenges via live camera."
                  : "Challenges skipped. Classic alarms will fire."}
              </Text>
            </View>
            <Switch
              value={prefs.aiVerificationEnabled}
              onValueChange={() => togglePref("aiVerificationEnabled")}
              trackColor={{ true: primary, false: "#444" }}
              thumbColor="#FFFFFF"
            />
          </Animated.View>

          {/* ── Appearance Section ── */}
          <Animated.View entering={FadeInDown.delay(150).duration(350)}>
            <Text style={[s.groupTitle, { color: textMuted }]}>Appearance</Text>

            {/* Dark mode row */}
            <View style={[s.row, { backgroundColor: card, borderColor: border }]}>
              <View style={[s.iconShell, { backgroundColor: isDark ? "rgba(245,200,66,0.15)" : "rgba(91,107,138,0.12)" }]}>
                <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={isDark ? "#F5C842" : "#5B6B8A"} />
              </View>
              <View style={s.rowCopy}>
                <Text style={[s.rowTitle, { color: textPrimary }]}>Dark Mode</Text>
                <Text style={[s.rowBody, { color: textMuted }]}>{isDark ? "Dark theme active" : "Light theme active"}</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleDark}
                trackColor={{ true: primary, false: border }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Theme picker */}
            <View style={[s.themeCard, { backgroundColor: card, borderColor: border }]}>
              <View style={s.themeCardHeader}>
                <View style={[s.iconShell, { backgroundColor: primaryLight }]}>
                  <Ionicons name="color-palette-outline" size={20} color={primary} />
                </View>
                <View style={s.rowCopy}>
                  <Text style={[s.rowTitle, { color: textPrimary }]}>Colour Theme</Text>
                  <Text style={[s.rowBody, { color: textMuted }]}>Choose your app palette</Text>
                </View>
              </View>

              <View style={s.themeGrid}>
                {THEME_LIST.map((t) => {
                  const isSelected = themeId === t.id;
                  const swatch = isDark ? t.dark.primary : t.light.primary;
                  const swatchBg = isDark ? t.dark.primaryLight : t.light.primaryLight;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[
                        s.themeTile,
                        { backgroundColor: isSelected ? swatch : surface, borderColor: isSelected ? swatch : border },
                        isSelected && s.themeTileSelected,
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        selectTheme(t.id);
                      }}
                      activeOpacity={0.75}
                    >
                      {/* Colour dot */}
                      <View style={[s.themeSwatchRow]}>
                        <View style={[s.themeSwatch, { backgroundColor: swatch }]} />
                        {isSelected && (
                          <View style={s.themeCheck}>
                            <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <Text style={s.themeEmoji}>{t.emoji}</Text>
                      <Text style={[s.themeName, { color: isSelected ? "#FFFFFF" : textPrimary }]} numberOfLines={1}>
                        {t.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </Animated.View>

          {/* ── Core Settings ── */}
          <Animated.View entering={FadeInDown.delay(200).duration(350)}>
            <Text style={[s.groupTitle, { color: textMuted }]}>Core Settings</Text>

            <TouchableOpacity
              style={[s.row, { backgroundColor: card, borderColor: border }]}
              onPress={() => togglePref("vibrationEnabled")}
            >
              <View style={[s.iconShell, { backgroundColor: primaryLight }]}>
                <Ionicons name="pulse" size={20} color={primary} />
              </View>
              <View style={s.rowCopy}>
                <Text style={[s.rowTitle, { color: textPrimary }]}>Haptic Feedback</Text>
                <Text style={[s.rowBody, { color: textMuted }]}>Intense vibration during verification</Text>
              </View>
              <Switch
                value={prefs.vibrationEnabled}
                onValueChange={() => togglePref("vibrationEnabled")}
                trackColor={{ true: primary, false: border }}
                thumbColor="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.row, { backgroundColor: card, borderColor: border }]}
              onPress={handlePermissionCheck}
            >
              <View style={[s.iconShell, { backgroundColor: primaryLight }]}>
                <Ionicons name="notifications" size={20} color={primary} />
              </View>
              <View style={s.rowCopy}>
                <Text style={[s.rowTitle, { color: textPrimary }]}>System Permissions</Text>
                <Text style={[s.rowBody, { color: textMuted }]}>Verify notification & alarm reliability</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={textMuted} />
            </TouchableOpacity>
          </Animated.View>

          {/* ── Danger Zone ── */}
          <Animated.View entering={FadeInDown.delay(250).duration(350)}>
            <Text style={[s.groupTitle, { color: textMuted }]}>Danger Zone</Text>

            <TouchableOpacity
              style={[s.row, { backgroundColor: card, borderColor: border }]}
              onPress={handleResetOnboarding}
            >
              <View style={[s.iconShell, { backgroundColor: danger + "15" }]}>
                <Ionicons name="refresh" size={20} color={danger} />
              </View>
              <View style={s.rowCopy}>
                <Text style={[s.rowTitle, { color: textPrimary }]}>Reset Onboarding</Text>
                <Text style={[s.rowBody, { color: textMuted }]}>Re-run the initial product tour</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Version ── */}
          <View style={s.versionBlock}>
            <Text style={[s.versionTxt, { color: textMuted }]}>SnapWake AI Build v1.2.0 (Stable)</Text>
            <Text style={[s.versionTxt, { color: textMuted }]}>Linked to Gemini Engine v1.5</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1 },
  safeArea:    { flex: 1 },
  content:     { padding: spacing.md, paddingBottom: 120 },

  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  pageTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 30,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontFamily: typography.family.regular,
    fontSize: 13,
    marginTop: 2,
  },
  securePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    marginTop: 4,
  },
  secureTxt: {
    fontFamily: typography.family.bold,
    fontSize: 12,
  },

  profileCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  avatarShell: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: typography.family.bold,
    fontSize: 16,
    letterSpacing: 1,
  },
  profileCopy: { flex: 1 },
  profileName: {
    fontFamily: typography.family.bold,
    fontSize: 16,
  },
  profileMeta: {
    fontFamily: typography.family.regular,
    fontSize: 12,
    marginTop: 3,
  },
  profileAction: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    borderRadius: 18,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: { flex: 1 },
  heroLabel: {
    fontFamily: typography.family.bold,
    fontSize: 10,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  heroValue: {
    fontFamily: typography.family.extraBold,
    fontSize: 20,
    color: "#FFFFFF",
    marginTop: 2,
  },
  heroSub: {
    fontFamily: typography.family.regular,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    marginTop: 4,
    lineHeight: 16,
  },

  groupTitle: {
    fontFamily: typography.family.bold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginTop: spacing.lg,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  iconShell: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  rowCopy: { flex: 1 },
  rowTitle: {
    fontFamily: typography.family.bold,
    fontSize: 15,
  },
  rowBody: {
    fontFamily: typography.family.regular,
    fontSize: 12,
    marginTop: 2,
  },

  // ── Theme Picker ──────────────────────────────────────────
  themeCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  themeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  themeTile: {
    width: "13%",
    minWidth: 72,
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 2,
    gap: 4,
  },
  themeTileSelected: {
    // border colour set inline
  },
  themeSwatchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  themeSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  themeCheck: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  themeEmoji: {
    fontSize: 18,
  },
  themeName: {
    fontFamily: typography.family.bold,
    fontSize: 10,
    textAlign: "center",
  },

  versionBlock: {
    marginTop: 40,
    alignItems: "center",
    opacity: 0.35,
  },
  versionTxt: {
    fontFamily: typography.family.medium,
    fontSize: 12,
    lineHeight: 18,
  },
});
