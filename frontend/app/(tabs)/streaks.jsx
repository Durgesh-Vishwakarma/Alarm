import { Ionicons } from "@expo/vector-icons";
import { GlassCard } from "../../src/components/GlassCard";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { loadWakeStats } from "../../src/services/streakService";
import { tokens, typography } from "../../src/theme";
import { useTheme } from "../../src/theme/ThemeContext";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StreaksTab() {
  const { theme, isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    loadWakeStats().then((s) => {
      if (alive) {
        setStats(s);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const { completionRate, level, xpProgress, weekBars } = useMemo(() => {
    if (!stats) {
      return { completionRate: 0, level: 1, xpProgress: 0, weekBars: [0, 0, 0, 0, 0, 0, 0] };
    }
    const rate = stats.attempted ? Math.round((stats.completed / stats.attempted) * 100) : 0;
    const currentLevel = Math.floor(stats.completed / 5) + 1;
    const currentXP = (stats.completed % 5) / 5;
    const week = Array.isArray(stats.week) && stats.week.length === 7 ? stats.week : [0, 0, 0, 0, 0, 0, 0];
    const maxVal = Math.max(...week, 1);
    const bars = week.map((w) => Math.min(100, Math.round((w / maxVal) * 100)));
    return { completionRate: rate, level: currentLevel, xpProgress: currentXP, weekBars: bars };
  }, [stats]);

  if (loading || !stats) {
    return (
      <View style={[s.container, { backgroundColor: theme.bg }]}>
        <SafeAreaView style={[s.safeArea, s.loadingWrap]} edges={["top"]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[s.loadingText, { color: theme.textMuted }]}>Loading your journey…</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={s.safeArea} edges={["top"]}>
        <Animated.View entering={FadeIn.duration(tokens.animation.duration.normal)} style={s.header}>
          <Text style={[s.metadata, { color: theme.textMuted }]}>YOUR JOURNEY</Text>
          <Text style={[s.pageTitle, { color: theme.textPrimary }]}>Performance</Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          {stats.attempted === 0 ? (
            <Animated.View entering={FadeInDown.delay(100).duration(tokens.animation.duration.normal)} style={s.emptyStateWrapper}>
              <GlassCard style={[s.xpCard, { borderColor: theme.cardBorder }]} containerStyle={s.emptyInner}>
                <View style={[s.emptyIconWrap, { backgroundColor: `${theme.primary}18` }]}>
                  <Ionicons name="bar-chart" size={32} color={theme.primary} />
                </View>
                <Text style={[s.emptyTitle, { color: theme.textPrimary }]}>No stats yet</Text>
                <Text style={[s.emptySubtitle, { color: theme.textSecondary }]}>
                  Complete your first wake challenge to see streaks, success rate, and weekly consistency.
                </Text>
              </GlassCard>
            </Animated.View>
          ) : (
            <>
              <Animated.View entering={FadeInDown.delay(100).duration(tokens.animation.duration.normal)}>
                <GlassCard style={[s.xpCard, { borderColor: theme.cardBorder }]} containerStyle={s.xpInner}>
                  <View style={s.xpHeader}>
                    <View>
                      <Text style={[s.levelLabel, { color: theme.textSecondary }]}>CURRENT LEVEL</Text>
                      <Text style={[s.levelVal, { color: theme.textPrimary }]}>Level {level}</Text>
                    </View>
                    <View style={[s.levelBadge, { backgroundColor: `${theme.primary}28` }]}>
                      <Ionicons name="trophy" size={18} color={theme.primary} />
                    </View>
                  </View>

                  <View style={s.progressContainer}>
                    <View style={[s.progressBarBg, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)" }]}>
                      <View
                        style={[
                          s.progressBarFill,
                          { width: `${xpProgress * 100}%`, backgroundColor: theme.primary },
                        ]}
                      />
                    </View>
                    <View style={s.progressMeta}>
                      <Text style={[s.progressText, { color: theme.textMuted }]}>
                        {Math.round(xpProgress * 5)}/5 verifications to next level
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </Animated.View>

              <View style={s.metricsRow}>
                <Animated.View entering={FadeInDown.delay(200).duration(tokens.animation.duration.normal)} style={s.metricItem}>
                  <GlassCard style={[s.metricCard, { borderColor: theme.cardBorder }]} containerStyle={s.metricInner}>
                    <View style={s.ringContainer}>
                      <View style={[s.ringBase, { borderColor: theme.divider }]} />
                      <View style={[s.ringActive, { borderColor: theme.primary, borderTopColor: "transparent" }]} />
                      <View style={s.ringContent}>
                        <Text style={[s.metricVal, { color: theme.textPrimary }]}>{stats.wakeStreak}</Text>
                        <Text style={[s.metricLabel, { color: theme.textSecondary }]}>STREAK</Text>
                      </View>
                    </View>
                  </GlassCard>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).duration(tokens.animation.duration.normal)} style={s.metricItem}>
                  <GlassCard style={[s.metricCard, { borderColor: theme.cardBorder }]} containerStyle={s.metricInner}>
                    <View style={s.ringContainer}>
                      <View style={[s.ringBase, { borderColor: theme.divider }]} />
                      <View
                        style={[
                          s.ringActive,
                          { borderColor: tokens.colors.success, borderRightColor: "transparent" },
                        ]}
                      />
                      <View style={s.ringContent}>
                        <Text style={[s.metricVal, { color: theme.textPrimary }]}>{completionRate}%</Text>
                        <Text style={[s.metricLabel, { color: theme.textSecondary }]}>SUCCESS</Text>
                      </View>
                    </View>
                  </GlassCard>
                </Animated.View>
              </View>

              <Animated.View entering={FadeInDown.delay(400).duration(tokens.animation.duration.normal)} style={s.section}>
                <Text style={[s.sectionLabel, { color: theme.textMuted }]}>WEEKLY CONSISTENCY</Text>
                <View style={[s.statsGrid, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                  <View style={s.barContainer}>
                    {weekBars.map((val, i) => (
                      <View key={i} style={s.barCol}>
                        <View style={[s.barBg, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)" }]}>
                          <View
                            style={[
                              s.barFill,
                              {
                                height: `${val}%`,
                                backgroundColor: i === 6 ? theme.primary : `${theme.primary}44`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[s.dayLabel, { color: i === 6 ? theme.textPrimary : theme.textMuted }]}>
                          {DAYS[i][0]}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Animated.View>
            </>
          )}

          <View style={{ height: 140 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontFamily: typography.family.metadata, fontSize: tokens.typography.size.body },
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
  xpCard: {
    borderWidth: 1,
  },
  xpInner: {
    padding: tokens.spacing.xl,
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: tokens.spacing.xl,
  },
  levelLabel: {
    fontFamily: typography.family.metadata,
    fontSize: tokens.typography.size.tiny,
    letterSpacing: 1.5,
  },
  levelVal: {
    fontFamily: typography.family.card,
    fontSize: tokens.typography.size.card,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    gap: tokens.spacing.md,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "center",
  },
  progressText: {
    fontFamily: typography.family.metadata,
    fontSize: tokens.typography.size.caption,
    opacity: 0.7,
  },
  metricsRow: {
    flexDirection: "row",
    gap: tokens.spacing.lg,
  },
  metricItem: {
    flex: 1,
  },
  metricCard: {
    borderWidth: 1,
  },
  metricInner: {
    paddingVertical: tokens.spacing.xl,
    alignItems: "center",
  },
  ringContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  ringBase: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
  },
  ringActive: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    transform: [{ rotate: "45deg" }],
  },
  ringContent: {
    alignItems: "center",
  },
  metricVal: {
    fontFamily: typography.family.card,
    fontSize: 28,
    letterSpacing: -1,
  },
  metricLabel: {
    fontFamily: typography.family.metadata,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: -2,
  },
  section: { gap: tokens.spacing.lg },
  sectionLabel: {
    fontFamily: typography.family.metadata,
    fontSize: tokens.typography.size.tiny,
    letterSpacing: 1.5,
    paddingHorizontal: 4,
    opacity: 0.5,
  },
  statsGrid: {
    padding: tokens.spacing.xl,
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
  },
  barContainer: { flexDirection: "row", justifyContent: "space-between", height: 100, alignItems: "flex-end" },
  barCol: { alignItems: "center", gap: 8 },
  barBg: { width: 28, height: 80, borderRadius: 14, overflow: "hidden", justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 14 },
  dayLabel: { fontFamily: typography.family.metadata, fontSize: tokens.typography.size.tiny, opacity: 0.6 },
  emptyStateWrapper: { flex: 1, justifyContent: "center", marginTop: tokens.spacing.xxl },
  emptyInner: { padding: tokens.spacing.xxl, alignItems: "center", gap: tokens.spacing.md },
  emptyIconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: tokens.spacing.md },
  emptyTitle: { fontFamily: typography.family.section, fontSize: tokens.typography.size.card },
  emptySubtitle: { fontFamily: typography.family.metadata, fontSize: tokens.typography.size.body, textAlign: "center", lineHeight: 22 },
});
