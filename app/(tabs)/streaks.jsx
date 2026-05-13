import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadWakeStats } from "../../src/services/streakService";
import { spacing, typography } from "../../src/theme";
import { useTheme } from "../../src/theme/ThemeContext";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function StreaksTab() {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadWakeStats().then(setStats);
  }, []);

  const rollingWeek = useMemo(() => {
    if (!stats?.events) return [0, 0, 0, 0, 0, 0, 0];
    const activity = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    stats.events.forEach((event) => {
      const eventDate = new Date(event.createdAt);
      const diffDays = Math.floor((now - eventDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7 && event.success) {
        activity[6 - diffDays] = 1;
      }
    });
    return activity;
  }, [stats]);

  const achievementsCatalog = useMemo(() => [
    { id: "1", title: "First Light",      desc: "Completed your first AI challenge",    icon: "sunny",           isUnlocked: (s) => s.completed > 0 },
    { id: "2", title: "Morning Rhythm",   desc: "Maintained a 3-day wake streak",       icon: "pulse",           isUnlocked: (s) => s.wakeStreak >= 3 },
    { id: "3", title: "Elite Riser",      desc: "Earned over 500 total XP",             icon: "trending-up",     isUnlocked: (s) => s.xp > 500 },
    { id: "4", title: "Lockdown Master",  desc: "Beat a maximum strictness alarm",      icon: "shield-checkmark",isUnlocked: (s) => s.events.some((e) => e.success && e.strictness === "Lockdown") },
  ], []);

  const achievementRows = useMemo(() => {
    if (!stats) return [];
    return achievementsCatalog.map((ach) => ({ ...ach, unlocked: ach.isUnlocked(stats) }));
  }, [achievementsCatalog, stats]);

  const completionRate = stats?.attempted
    ? Math.round((stats.completed / stats.attempted) * 100)
    : 0;

  if (!stats) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.statusBar} backgroundColor={theme.bg} translucent={false} />
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          entering={FadeInDown.duration(450)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Wake Streak</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Your morning consistency and AI challenge history.
            </Text>
          </View>

          {/* Hero Streak Card */}
          <View style={[styles.heroCard, { backgroundColor: theme.heroCard, borderColor: theme.heroBorder }]}>
            <View style={styles.streakInfo}>
              <View style={[styles.xpBadge, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                <Ionicons name="flash" size={12} color="#FFFFFF" />
                <Text style={styles.xpText}>{stats.xp} XP</Text>
              </View>
              <Text style={styles.streakNumber}>{stats.wakeStreak}</Text>
              <Text style={styles.streakLabel}>DAY STREAK</Text>
            </View>
            <View style={[styles.heroSlash, { backgroundColor: "rgba(255,255,255,0.04)" }]} />
            <View style={[styles.heroMark, { borderColor: theme.primary + "28" }]} />
          </View>

          {/* Rolling Week Activity */}
          <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>Morning Activity</Text>
              <Text style={[styles.chartSubtitle, { color: theme.textSecondary }]}>Last 7 verified days</Text>
            </View>
            <View style={styles.barContainer}>
              {rollingWeek.map((active, i) => (
                <View key={i} style={styles.barWrapper}>
                  <View style={[
                    styles.bar,
                    { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                    active && { height: 78, backgroundColor: theme.primary, borderColor: theme.primary },
                  ]} />
                  <Text style={[styles.barLabel, { color: theme.textMuted }]}>{DAYS[i]}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.statsVal, { color: theme.textPrimary }]}>{stats.completed}</Text>
              <Text style={[styles.statsLabel, { color: theme.textMuted }]}>AI CLEARS</Text>
            </View>
            <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.statsVal, { color: theme.textPrimary }]}>{completionRate}%</Text>
              <Text style={[styles.statsLabel, { color: theme.textMuted }]}>WIN RATE</Text>
            </View>
          </View>

          {/* Achievements */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Achievements</Text>
          {achievementRows.map((ach) => (
            <View
              key={ach.id}
              style={[
                styles.achievementRow,
                { backgroundColor: ach.unlocked ? theme.card : theme.surface, borderColor: ach.unlocked ? theme.cardBorder : theme.divider },
              ]}
            >
              <View style={[
                styles.achievementIcon,
                { backgroundColor: theme.primaryLight },
                ach.unlocked && { borderWidth: 1, borderColor: theme.primary },
              ]}>
                <Ionicons name={ach.icon} size={20} color={ach.unlocked ? theme.primary : theme.textMuted} />
              </View>
              <View style={styles.achievementCopy}>
                <Text style={[styles.achievementTitle, { color: ach.unlocked ? theme.textPrimary : theme.textMuted }]}>
                  {ach.title}
                </Text>
                <Text style={[styles.achievementBody, { color: ach.unlocked ? theme.textSecondary : theme.textMuted }]}>
                  {ach.desc}
                </Text>
              </View>
              <Ionicons
                name={ach.unlocked ? "checkmark-circle" : "lock-closed"}
                size={20}
                color={ach.unlocked ? theme.primary : theme.textMuted}
              />
            </View>
          ))}
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 120 },
  header: { marginBottom: spacing.lg },
  title: { fontFamily: typography.family.bold, fontSize: 32, letterSpacing: 0 },
  subtitle: { fontFamily: typography.family.regular, fontSize: 16, marginTop: 4, lineHeight: 22 },

  heroCard: {
    borderRadius: 32,
    height: 180,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  streakInfo: { alignItems: "center", zIndex: 2 },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  xpText: { fontFamily: typography.family.bold, fontSize: 13, color: "#FFFFFF" },
  streakNumber: {
    fontFamily: typography.family.extraBold,
    fontSize: 72,
    color: "#FFFFFF",
    lineHeight: 76,
    letterSpacing: 0,
  },
  streakLabel: {
    fontFamily: typography.family.bold,
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.6,
    letterSpacing: 2,
  },
  heroMark: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 32,
    opacity: 1,
    transform: [{ rotate: "-18deg" }],
  },
  heroSlash: {
    position: "absolute",
    width: 140,
    height: 260,
    transform: [{ rotate: "-18deg" }],
    right: -20,
    top: -40,
  },

  chartCard: { borderRadius: 24, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1 },
  chartHeader: { marginBottom: 20 },
  chartTitle: { fontFamily: typography.family.bold, fontSize: 18 },
  chartSubtitle: { fontFamily: typography.family.regular, fontSize: 13 },
  barContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 96,
    paddingHorizontal: 6,
  },
  barWrapper: { alignItems: "center", gap: 10 },
  bar: { width: 30, height: 50, borderRadius: 10, borderWidth: 1 },
  barLabel: { fontFamily: typography.family.bold, fontSize: 11 },

  statsGrid: { flexDirection: "row", gap: 12, marginBottom: spacing.lg },
  statsCard: { flex: 1, borderRadius: 22, padding: spacing.md, alignItems: "center", borderWidth: 1 },
  statsVal: { fontFamily: typography.family.extraBold, fontSize: 24 },
  statsLabel: { fontFamily: typography.family.bold, fontSize: 11, marginTop: 4 },

  sectionTitle: { fontFamily: typography.family.bold, fontSize: 18, marginBottom: 16, marginTop: 8 },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 22,
    padding: spacing.sm,
    marginBottom: 12,
    borderWidth: 1,
  },
  achievementIcon: { width: 46, height: 46, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  achievementCopy: { flex: 1 },
  achievementTitle: { fontFamily: typography.family.bold, fontSize: 16 },
  achievementBody: { fontFamily: typography.family.regular, fontSize: 13, marginTop: 2 },
});
