import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAtom } from "jotai";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { preferencesAtom } from "../../src/atoms/alarmAtoms";
import { CustomSwitch } from "../../src/components/CustomSwitch";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { tokens, typography } from "../../src/theme";
import { useTheme } from "../../src/theme/ThemeContext";
import { haptics } from "../../src/services/hapticService";

const delay = (i) => 80 + i * 70;

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

  return (
    <View style={[s.container, { backgroundColor: theme.bg }]}>
      <View style={s.orangeOrb} />
      <View style={s.orangeOrbTwo} />

      <SafeAreaView style={s.safeArea} edges={["top"]}>
        <Animated.View entering={FadeIn.duration(420)} style={s.header}>
          <Text style={[s.kicker, { color: theme.primary }]}>SNAPWAKE</Text>
          <Text style={[s.pageTitle, { color: theme.textPrimary }]}>
            Settings
          </Text>
          <Text style={[s.subtitle, { color: theme.textSecondary }]}>
            Control your wake experience.
          </Text>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
        >
          <Animated.View entering={FadeInDown.delay(delay(0)).duration(420)}>
            <LinearGradient
              colors={["#FF8A1C", "#FF5E1A", "#111827"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.profileHero}
            >
              <View style={s.heroBlobOne} />
              <View style={s.heroBlobTwo} />

              <View style={s.avatar}>
                <Ionicons name="person" size={24} color="#FF7A18" />
              </View>

              <View style={s.userInfo}>
                <Text style={s.userName}>Durgesh</Text>
                <Text style={s.userMeta}>Level 12 • Early Bird Streak</Text>
              </View>

              <View style={s.heroBadge}>
                <Ionicons name="shield-checkmark" size={20} color="#FFF" />
              </View>
            </LinearGradient>
          </Animated.View>

          <SettingsGroup
            delayIndex={1}
            title="Experience"
            theme={theme}
            rows={[
              {
                label: "AI verification",
                icon: "scan",
                value: prefs.aiVerificationEnabled,
                onPress: () => togglePref("aiVerificationEnabled"),
              },
              {
                label: "Haptic feedback",
                icon: "phone-portrait",
                value: prefs.hapticsEnabled,
                onPress: () => togglePref("hapticsEnabled"),
              },
              {
                label: "Smart wake suggestions",
                icon: "bulb",
                value: prefs.smartWakeEnabled,
                onPress: () => togglePref("smartWakeEnabled"),
              },
              {
                label: "Vibration",
                icon: "volume-high",
                value: prefs.vibrationEnabled,
                onPress: () => togglePref("vibrationEnabled"),
              },
              {
                label: "Auto-open camera",
                icon: "camera",
                value: prefs.autoLaunchCamera,
                onPress: () => togglePref("autoLaunchCamera"),
              },
            ]}
          />

          <Animated.View
            entering={FadeInDown.delay(delay(2)).duration(420)}
            style={s.group}
          >
            <Text style={[s.groupLabel, { color: theme.textMuted }]}>
              System
            </Text>

            <View
              style={[
                s.groupCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <TouchableOpacity style={s.row} onPress={handleToggleDark}>
                <View style={s.rowLeft}>
                  <View style={s.iconBox}>
                    <Ionicons
                      name={isDark ? "moon" : "sunny"}
                      size={17}
                      color={theme.primary}
                    />
                  </View>

                  <View>
                    <Text style={[s.rowLabel, { color: theme.textPrimary }]}>
                      Appearance
                    </Text>
                    <Text style={[s.rowSub, { color: theme.textMuted }]}>
                      {isDark ? "Dark mode enabled" : "Light mode enabled"}
                    </Text>
                  </View>
                </View>

                <View style={s.rowRight}>
                  <Text style={[s.rowValue, { color: theme.primary }]}>
                    {isDark ? "Dark" : "Light"}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={15}
                    color={theme.textMuted}
                  />
                </View>
              </TouchableOpacity>

              <View style={[s.divider, { backgroundColor: theme.divider }]} />

              <TouchableOpacity
                style={s.row}
                onPress={() => haptics.selection()}
              >
                <View style={s.rowLeft}>
                  <View style={s.iconBox}>
                    <Ionicons
                      name="notifications"
                      size={17}
                      color={theme.primary}
                    />
                  </View>

                  <View>
                    <Text style={[s.rowLabel, { color: theme.textPrimary }]}>
                      Notifications
                    </Text>
                    <Text style={[s.rowSub, { color: theme.textMuted }]}>
                      Alarm alerts and reminders
                    </Text>
                  </View>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={15}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(delay(3)).duration(420)}>
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

          <View style={{ height: 130 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const SettingsGroup = ({ title, rows, theme, delayIndex }) => (
  <Animated.View
    entering={FadeInDown.delay(delay(delayIndex)).duration(420)}
    style={s.group}
  >
    <Text style={[s.groupLabel, { color: theme.textMuted }]}>{title}</Text>

    <View
      style={[
        s.groupCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
        },
      ]}
    >
      {rows.map((item, index) => (
        <View key={item.label}>
          <SettingRow item={item} theme={theme} />
          {index !== rows.length - 1 ? (
            <View style={[s.divider, { backgroundColor: theme.divider }]} />
          ) : null}
        </View>
      ))}
    </View>
  </Animated.View>
);

const SettingRow = ({ item, theme }) => (
  <View style={s.row}>
    <View style={s.rowLeft}>
      <View style={s.iconBox}>
        <Ionicons name={item.icon} size={17} color={theme.primary} />
      </View>

      <Text style={[s.rowLabel, { color: theme.textPrimary }]}>
        {item.label}
      </Text>
    </View>

    <CustomSwitch
      value={item.value}
      onValueChange={item.onPress}
      activeColor={theme.primary}
      inactiveColor="rgba(148,163,184,0.22)"
      thumbOnColor="#FFF"
      thumbOffColor="#FFF"
    />
  </View>
);

const s = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  orangeOrb: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,122,24,0.16)",
    top: 70,
    right: -160,
  },

  orangeOrbTwo: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(255,94,26,0.09)",
    top: 460,
    left: -140,
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 18,
  },

  kicker: {
    ...typography.styles.caption,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 8,
  },

  pageTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -2,
  },

  subtitle: {
    ...typography.styles.body,
    marginTop: 8,
    lineHeight: 22,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 24,
  },

  profileHero: {
    minHeight: 132,
    borderRadius: 34,
    padding: 22,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },

  heroBlobOne: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(255,255,255,0.13)",
    right: -60,
    top: -70,
  },

  heroBlobTwo: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.08)",
    left: -38,
    bottom: -42,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 22,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  userInfo: {
    flex: 1,
    marginLeft: 16,
  },

  userName: {
    fontFamily: typography.family.extraBold,
    fontSize: 25,
    lineHeight: 29,
    letterSpacing: -1,
    color: "#FFF",
  },

  userMeta: {
    ...typography.styles.caption,
    color: "rgba(255,255,255,0.72)",
    marginTop: 4,
  },

  heroBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    alignItems: "center",
    justifyContent: "center",
  },

  group: {
    gap: 12,
  },

  groupLabel: {
    ...typography.styles.caption,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingHorizontal: 4,
  },

  groupCard: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
  },

  row: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  rowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: "rgba(255,122,24,0.13)",
    alignItems: "center",
    justifyContent: "center",
  },

  rowLabel: {
    fontFamily: typography.family.semiBold,
    fontSize: 15,
    letterSpacing: -0.2,
  },

  rowSub: {
    ...typography.styles.caption,
    marginTop: 2,
    opacity: 0.72,
  },

  rowValue: {
    ...typography.styles.caption,
    fontWeight: "800",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 67,
  },

  proBtn: {
    marginTop: 4,
    marginBottom: 10,
  },

  proHint: {
    ...typography.styles.caption,
    textAlign: "center",
    opacity: 0.72,
    paddingHorizontal: 24,
  },
});