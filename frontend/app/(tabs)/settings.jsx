import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAtom } from "jotai";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
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

  return (
    <View style={[s.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={s.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          <Text style={[s.pageTitle, { color: theme.textPrimary }]}>Settings</Text>

          <SettingItem
            label="Dark Mode"
            icon={isDark ? "sunny" : "moon"}
            theme={theme}
            right={<Switch value={isDark} onValueChange={toggleDark} trackColor={{ true: theme.primary }} />}
          />

          <View style={[s.themeSection, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[s.sectionLabel, { color: theme.textMuted }]}>Theme Color</Text>
            <View style={s.themeGrid}>
              {THEME_LIST.map((t) => {
                const isSelected = themeId === t.id;
                const swatch = isDark ? t.dark.primary : t.light.primary;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[s.themeTile, { backgroundColor: isSelected ? swatch : theme.surface, borderColor: isSelected ? swatch : theme.cardBorder }]}
                    onPress={() => { Haptics.selectionAsync(); selectTheme(t.id); }}
                  >
                    <Text style={s.themeEmoji}>{t.emoji}</Text>
                    <Text style={[s.themeName, { color: isSelected ? "#FFF" : theme.textPrimary }]}>{t.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <SettingItem
            label="AI Verification"
            icon="scan"
            theme={theme}
            right={<Switch value={prefs.aiVerificationEnabled} onValueChange={() => togglePref("aiVerificationEnabled")} trackColor={{ true: theme.primary }} />}
          />

          <SettingItem
            label="Haptic Feedback"
            icon="pulse"
            theme={theme}
            right={<Switch value={prefs.vibrationEnabled} onValueChange={() => togglePref("vibrationEnabled")} trackColor={{ true: theme.primary }} />}
          />

          <TouchableOpacity
            style={[s.row, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={async () => {
              const status = await requestNotificationPermissions();
              alert(`Notification Status: ${status}`);
            }}
          >
            <Ionicons name="notifications" size={20} color={theme.primary} />
            <Text style={[s.rowTitle, { color: theme.textPrimary }]}>Check Permissions</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} style={{ marginLeft: "auto" }} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const SettingItem = ({ label, icon, theme, right }) => (
  <View style={[s.row, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
    <Ionicons name={icon} size={20} color={theme.primary} />
    <Text style={[s.rowTitle, { color: theme.textPrimary }]}>{label}</Text>
    <View style={{ marginLeft: "auto" }}>{right}</View>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: spacing.md, gap: 12 },
  pageTitle: { fontFamily: typography.family.extraBold, fontSize: 28, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 16, borderWidth: 1 },
  rowTitle: { fontFamily: typography.family.bold, fontSize: 15 },
  themeSection: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  sectionLabel: { fontSize: 11, fontFamily: typography.family.bold, textTransform: "uppercase" },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  themeTile: { flex: 1, minWidth: 70, borderRadius: 12, padding: 12, alignItems: "center", gap: 4, borderWidth: 1.5 },
  themeEmoji: { fontSize: 18 },
  themeName: { fontFamily: typography.family.bold, fontSize: 10 },
});
